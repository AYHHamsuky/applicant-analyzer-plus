import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Parse CV function called, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Parsing request body...');
    const { fileUrl, fileName, jobRequirements } = await req.json()
    console.log('Received data:', { fileUrl, fileName, jobRequirements });

    // Get OpenAI API key from secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment');
      throw new Error('OpenAI API key not found')
    }
    console.log('OpenAI API key found');

    // Download file content
    console.log('Downloading file from:', fileUrl);
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.status} ${fileResponse.statusText}`)
    }
    const fileContent = await fileResponse.text()
    console.log('File downloaded, content length:', fileContent.length);

    // Create AI prompt for CV analysis
    const prompt = `
Analyze this CV/Resume content and extract the following information in JSON format:

Job Requirements:
- Required Skills: ${jobRequirements?.requiredSkills?.join(', ') || 'Not specified'}
- Experience Level: ${jobRequirements?.experienceLevel || 'Not specified'}
- Education: ${jobRequirements?.education || 'Not specified'}

CV Content:
${fileContent}

Please return a JSON object with the following structure:
{
  "candidateName": "Full name of the candidate",
  "email": "Email address",
  "phone": "Phone number",
  "skills": ["array", "of", "technical", "skills"],
  "experience": "Years of experience and brief description",
  "education": "Education background",
  "summary": "Brief professional summary (2-3 sentences)",
  "matchingSkills": ["skills", "that", "match", "job", "requirements"],
  "missingSkills": ["required", "skills", "not", "found"],
  "score": 85
}

Calculate the score (0-100) based on:
- Skills match with job requirements (40%)
- Experience level relevance (30%)
- Education background (20%)
- Overall profile strength (10%)

Ensure all fields are properly filled. If information is not available, use "Not specified" or empty arrays as appropriate.
`

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst specializing in CV/Resume parsing and candidate evaluation. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    const analysisText = openaiData.choices[0].message.content

    // Parse the JSON response
    let analysisResult
    try {
      analysisResult = JSON.parse(analysisText)
    } catch (e) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse AI response as JSON')
      }
    }

    // Add metadata
    const result = {
      id: crypto.randomUUID(),
      fileName,
      ...analysisResult,
      processedAt: new Date().toISOString()
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error parsing CV:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to parse CV' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    )
  }
})
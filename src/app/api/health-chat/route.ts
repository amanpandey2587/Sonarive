import type { NextApiRequest,NextApiResponse } from "next";

export default async function handler(req:NextApiRequest,res:NextApiResponse){
    const {messages}=req.body;
    console.log("Printing the sonar api key",process.env.SONAR_API_KEY) 
    try{
        const response=await fetch("https://api.perplexity.ai/chat/completions",{
            method:"POST",
            headers:{
                "Authorization":`Bearer ${process.env.SONAR_API_KEY}`,
                "Content-Type":"application/json",
            },
            body:JSON.stringify({
                model:"sonar-pro",
                messages,
            }),
        });
        const result=await response.json();
        console.log('Result in the api response is',result);
        const reply=result?.choices?.[0]?.message?.content||"Sorry I could not find that .";
        res.status(200).json({response:reply});
    }catch(error){
        res.status(500).json({error:"Internal Server Error"});
    }
}
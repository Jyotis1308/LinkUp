import {StreamChat} from "stream-chat"
import  "dotenv/config"
const apiKey=process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;



if(!apiKey || !apiSecret){
    console.error("Stream API key or Secret is missing");
    process.exit(1);
}

const streamClient = StreamChat.getInstance(apiKey,apiSecret);

export const upsertStreamUser= async (userData)=>{
    try{
        await streamClient.upsertUsers([userData]);
        return userData;
    }catch(error){
   console.error("Error upserting Stream user", error);
    }
};

export const generateStreamToken = (userId) => {
    try{
          const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
        

    }catch(error){
        console.log("Error generating Stream token:",error)
    }
};
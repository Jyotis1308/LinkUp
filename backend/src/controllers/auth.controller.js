import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";
export async function signup(req, res) {
  const { email, password, fullname } = req.body;

  try {
   

    if (!email || !password || !fullname) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    

    const seed = Math.random().toString(36).substring(2, 10);
    const randomAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;

    const newUser = await User.create({
      email,
      fullname,
      password,
      profilePic: randomAvatar, 
    });



    // Optional: If error is from here, catch it separately
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullname,
        image: newUser.profilePic || "",
      });
      console.log(` Stream user created for ${newUser.fullname}`);
    } catch (error) {
      console.log(" Error creating Stream user", error);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log(" Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req,res){
    try{
        const {email,password}= req.body;
        if(!email||!password){
            return res.status(400).json({message:"All feilds are required"});
        }

        const user = await User.findOne({email});
        if(!user) return res.status(401).json({message:"Invalid email or password"});

        const isPasswordCorrect = await user.matchPassword(password)
        if(!isPasswordCorrect) return res.status(401).json({message:"Invalid email or password"});
        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{
        expiresIn:"7d"
    })

    res.cookie("jwt",token ,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure: process.env.NODE_ENV==="production"
    })

    res.status(200).json({success:true,user})
    }
catch(error){
 console.log("Error in login controller",error)
 res.status(500).json({message:"Internal Server Error"});
}
};
export function logout(req,res){
    res.clearCookie("jwt")
    res.status(200).json({success:true,message:"Logout successfull"})
};

export async function onboard(req,res){
   try{
const userId=req.user._id

const {fullname,bio,nativeLanguage,learningLanguage,location}=req.body

if(!fullname||!bio||!nativeLanguage||!learningLanguage||!location){
    return res.status(400).json({
        message:"All fields are required",
        missingFields: [
     !fullname&&"fullname",
     !bio&&"bio",
     !nativeLanguage&&"nativeLanguage",
     !learningLanguage&&"learningLanguage",
     !location&&"location",
        ].filter(Boolean),
    });
}
const updatedUser = await User.findByIdAndUpdate(userId,{
    ...req.body,
    isOnboarded:true,
},{new:true})

if(!updatedUser) return res.status(404).json({message:"User not found"});
try{
 await upsertStreamUser({
    id:updatedUser._id.toString(),
    name:updatedUser.fullname,
    image:updatedUser.profilePic||"",
 })
console.log(`Stream user updated after onboarding for ${updatedUser.fullname}`);
}catch(streamError){
  console.log("Error updating tream user during onboarding",streamError.message);
 }

res.status(200).json({success:true, user:updatedUser});
   }catch(error){
    console.error("Onboarding Error",error)
    res.status(500).json({message:"Internal server error"})
   }
}
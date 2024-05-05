import { ApiResponse } from "../utils/ApiResponse.js";
import { User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({
            validateBeforeSave: false
        })

        return {accessToken, refreshToken}
    } catch (error) {
        
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async(req, res) => {
    //get user details
    //validation- not empty
    //check user exists already: username, email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user account creation
    // return response

    const {fullName, email,  password} = req.body
    //console.log("email:", email);

    if(
        [fullName, email, password].some((field) => field?.trim() === "") 
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email}]
    })

    if(existedUser) throw new ApiError(409, "User with email or username already exists")

    // const avatarLocalPath = req.files?.avatar[0]?.path;

    // if (!avatarLocalPath) {
    //     throw new ApiError(400, "Avatar file is required")
    // }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)

    // if (!avatar) {
    //     throw new ApiError(400, "Avatar file is required")
    // }

    const user = await User.create({
        fullName,
        // avatar: avatar.url,
        email,
        password
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    } 

    return res.status(201).json(
        new ApiResponse(200,  "User registered Successfully") 
    )
})

const loginUser = asyncHandler(async(req, res) => { 
    //req.body => data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email, password} = req.body

    if(!email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
     throw new ApiError(401, "Invalid user credentials")
     }

     const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

     const options = {
        httpOnly: true,
        secure: true,
        // sameSite: "none",
        // maxAge: 1000 * 60 * 60,
     }

     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
        new ApiResponse(
            200,
            {   
                user:  accessToken,
                loggedInUser, refreshToken
            },
            "User logged In Successfully"
        )
     )

})

const logoutUser = asyncHandler(async (req, res) => {
    //expire refresh token
    //clear cookie

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refrshToken")
    .json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if(!user) throw new ApiError(401, "invalid refresh token")


    } catch (error) {
        
    }
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    
}
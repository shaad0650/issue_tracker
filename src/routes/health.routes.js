import express from "express";
import prisma from "../config/db.js";

const router=express.Router()

router.get("/health",async(req,res)=>{
    await prisma.$queryRaw`SELECT 1`
    res.status(200).json({status:"ok",db:"connected"})
})


export default router;
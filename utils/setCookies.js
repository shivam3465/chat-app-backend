export const setCookie=(res,statusCode=200,tokenName="token",token="",time=0,message="",data=null)=>{
    return res
        .status(statusCode).cookie(tokenName,token,{
            expires: new Date(Date.now()+time),
            httpOnly: true,
            sameSite: "none",
            secure: true,
        })
        .json({success:true,message,...data});
}
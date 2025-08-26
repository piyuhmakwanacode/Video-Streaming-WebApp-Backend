//? this AsyncHandler  function with try catch
// const AsyncHandler =  (fn) => async (req,res,next) => {
//   try {
//     await fn(req,res,next)
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message:error.massage
//     })
//   }
// }

//? this AsyncHandler  function with promise

const AsyncHandler  = (requestHandler) => {
  return  (req,res,next) => {
    Promise.resolve(requestHandler(req,res,next)).catch((err) => {
      next(err)
    })
  }
}
export { AsyncHandler }

  export const option = {
    httpOnly: true,
    secure: true,
  };
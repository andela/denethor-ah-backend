import { Router } from 'express';
import { registerUser, verifyUser } from '../controllers/user';
import registrationValidation from '../middlewares/validation/user';

const userRouter = Router();

userRouter.post('/', registrationValidation, registerUser);

userRouter.patch('/:id', verifyUser);

export default userRouter;

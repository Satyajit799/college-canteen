import { Router } from "express";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

import { authenticateStudent } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/create-order",
  authenticateStudent,
  createPaymentOrder
);

router.post(
  "/verify",
  authenticateStudent,
  verifyPayment
);

export default router;
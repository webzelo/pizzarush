"use client"

import { motion } from "framer-motion"

/** Client wrapper so server components can use motion.div without calling a client factory from the server. */
export const MotionDiv = motion.div

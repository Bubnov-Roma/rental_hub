"use client";
import { motion } from "framer-motion";

export const FormConsentInfo = ({ canSubmit }: { canSubmit: boolean }) => {
	return (
		<div className="absolute bottom-0 left-0 flex flex-col justify-center items-center w-full px-4 pb-2">
			<motion.p
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				key={canSubmit ? "consent" : "warning"}
				className="text-[10px] md:text-xs text-center text-foreground/50 flex items-center justify-center w-full max-w-2xl"
			>
				{!canSubmit ? (
					<span>
						Для отправки анкеты, пожалуйста, заполните все обязательные поля
					</span>
				) : (
					<span>
						Отправляя анкету, Вы принимаете условия сотрудничества и даете
						согласие на обработку персональных данных
					</span>
				)}
			</motion.p>
		</div>
	);
};

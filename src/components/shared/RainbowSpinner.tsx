import type { PropsWithChildren } from "react";
import style from "@/styles/components/rainbow-spinner.module.css";

export const RainbowSpinner = ({ children }: PropsWithChildren) => (
	<div className={style.rainbowSpinner}>
		{children && (
			<div className="text-foreground text-2xl font-bold text-center mb-10">
				{children}
			</div>
		)}
	</div>
);

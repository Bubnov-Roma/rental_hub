"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return <div className="w-10 h-10" />;

	const isDark = theme === "dark";

	const toggleTheme = () => {
		setTheme(isDark ? "light" : "dark");
		if (typeof window !== "undefined" && navigator.vibrate) {
			navigator.vibrate(5);
		}
	};

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className={cn("flex mr-2 w-full", className)}
		>
			{isDark ? <Moon className="mr-4" /> : <Sun className="mr-4" />}
			<span>Тема</span>
		</button>
	);
}

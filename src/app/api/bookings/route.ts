import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();

		if (userError || !user) {
			return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
		}

		const body = await request.json();
		const { equipment_id, start_date, end_date, total_amount, metadata } = body;

		const { data: existingBookings } = await supabase
			.from("bookings")
			.select("*")
			.eq("equipment_id", equipment_id)
			.or(`start_date.lte.${end_date},end_date.gte.${start_date}`)
			.neq("status", "cancelled");

		if (existingBookings && existingBookings.length > 0) {
			return NextResponse.json(
				{ error: "Оборудование уже забронировано на эти даты" },
				{ status: 400 }
			);
		}

		// Создаем бронирование
		const { data: booking, error } = await supabase
			.from("bookings")
			.insert([
				{
					user_id: user.id,
					equipment_id,
					start_date,
					end_date,
					total_amount,
					metadata,
					status: "pending",
				},
			])
			.select()
			.single();

		if (error) throw error;

		return NextResponse.json({ booking }, { status: 201 });
	} catch (error) {
		console.error("Error creating booking:", error);
		return NextResponse.json(
			{ error: "Ошибка при создании бронирования" },
			{ status: 500 }
		);
	}
}

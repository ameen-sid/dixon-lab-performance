import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const planId = parseInt(id);

		const plan = await prisma.testPlan.findUnique({
			where: { id: planId },
			include: {
				testType: true,
				testCategory: true,
				testProtocol: true,
				dailyLogs: {
					orderBy: { date: "asc" }
				}
			}
		});

		if (!plan) return new Response("Plan not found", { status: 404 });

		const doc = new jsPDF() as any;

		// --- Header Section ---
		doc.setFillColor(15, 23, 42); // slate-900
		doc.rect(0, 0, 210, 40, "F");
		
		doc.setTextColor(255, 255, 255);
		doc.setFontSize(22);
		doc.setFont("helvetica", "bold");
		doc.text("DIXON LABORATORY", 105, 18, { align: "center" });
		
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		doc.text("RELIABILITY TEST REPORT", 105, 28, { align: "center" });
		doc.text(`ID: RP-${plan.id.toString().padStart(4, '0')}`, 105, 33, { align: "center" });

		// --- Test Info Section ---
		doc.setTextColor(15, 23, 42);
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text("1. TEST OVERVIEW", 20, 55);
		
		autoTable(doc, {
			startY: 60,
			theme: 'grid',
			headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' },
			body: [
				["Test Protocol", plan.testProtocol.name],
				["Test Type", plan.testType.name],
				["Test Category", plan.testCategory.name],
				["Product Type", plan.testProtocol.productType],
				["Station(s)", plan.stationIds || "N/A"],
				["Duration", `${plan.numDays} Days`],
				["Schedule", `${format(new Date(plan.startDate), "dd MMM yyyy")} - ${format(new Date(plan.endDate), "dd MMM yyyy")}`],
				["Status", plan.status]
			],
			margin: { left: 20, right: 20 }
		});

		// --- Judgement Criteria ---
		const finalY = (doc as any).lastAutoTable.finalY + 15;
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text("2. JUDGEMENT CRITERIA", 20, finalY);
		
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		const criteria = plan.testProtocol.judgementCriteria || "No specific criteria defined.";
		const splitCriteria = doc.splitTextToSize(criteria, 170);
		doc.text(splitCriteria, 20, finalY + 10);

		// --- Daily Logs Section ---
		const logsY = finalY + 10 + (splitCriteria.length * 5) + 10;
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text("3. EXECUTION SUMMARY (DAILY LOGS)", 20, logsY);

		const logRows = plan.dailyLogs.map((log, i) => [
			i + 1,
			format(new Date(log.date), "dd/MM"),
			log.totalCycles || "N/A",
			log.remarks || "No abnormalities observed."
		]);

		autoTable(doc, {
			startY: logsY + 5,
			head: [["S.No", "Date", "Cycles", "Remarks / Observations"]],
			body: logRows,
			theme: 'striped',
			headStyles: { fillColor: [15, 23, 42] },
			margin: { left: 20, right: 20 }
		});

		// --- Final Result Section ---
		const resultY = (doc as any).lastAutoTable.finalY + 20;
		doc.setFillColor(plan.status === "FAILED" ? 254 : 240, plan.status === "FAILED" ? 242 : 253, plan.status === "FAILED" ? 242 : 244);
		doc.rect(20, resultY - 10, 170, 30, "F");
		
		doc.setFontSize(16);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(plan.status === "FAILED" ? 185 : 5, plan.status === "FAILED" ? 28 : 150, plan.status === "FAILED" ? 28 : 105);
		doc.text(`FINAL VERDICT: ${plan.status}`, 105, resultY + 5, { align: "center" });
		
		doc.setFontSize(9);
		doc.setTextColor(100, 116, 139);
		doc.text("System Generated Report - Dixon Laboratory Management System", 105, 285, { align: "center" });

		const pdfOutput = doc.output("arraybuffer");
		const buffer = Buffer.from(pdfOutput);
		
		return new Response(buffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="TestReport_${plan.id}.pdf"`
			}
		});

	} catch (error: any) {
		console.error("PDF Gen Error:", error);
		return new Response("Failed to generate PDF", { status: 500 });
	}
}

import { NextRequest, NextResponse } from "next/server";
import { parseCSV, parseExcel } from "@/lib/parseData";
import { saveData } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请上传文件" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    let parsed;

    if (ext === "csv") {
      parsed = await parseCSV(file);
    } else if (ext === "xlsx" || ext === "xls") {
      parsed = await parseExcel(file);
    } else {
      return NextResponse.json(
        { error: "仅支持 CSV 和 Excel 文件" },
        { status: 400 }
      );
    }

    saveData(parsed.id, parsed);

    return NextResponse.json({
      id: parsed.id,
      fileName: parsed.fileName,
      headers: parsed.headers.map((h) => ({
        name: h.name,
        type: h.type,
        sampleValues: h.sampleValues,
      })),
      rowCount: parsed.rowCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "文件解析失败" },
      { status: 500 }
    );
  }
}

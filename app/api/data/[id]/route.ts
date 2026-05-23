import { NextRequest, NextResponse } from "next/server";
import { getData } from "@/lib/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = getData(id);

  if (!data) {
    return NextResponse.json(
      { error: "数据不存在，请重新上传" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: data.id,
    fileName: data.fileName,
    headers: data.headers,
    rows: data.rows.slice(0, 100),
    rowCount: data.rowCount,
  });
}

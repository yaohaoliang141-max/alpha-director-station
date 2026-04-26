import { NextRequest, NextResponse } from 'next/server';
import { DirectorEngine } from '@/lib/engine/directorEngine';

const engine = new DirectorEngine();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const script = formData.get('script') as string;
    const video = formData.get('reference_video') as File;

    if (!script || !video) {
      return NextResponse.json({ error: '请提供剧本和样片' }, { status: 400 });
    }

    // 限制样片大小为 30MB 内，防止 Payload Too Large / Vercel Serverless 超时
    const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30MB
    if (video.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: '样片文件过大，请上传 30MB 以内的视频以便大模型快速处理。' }, { status: 400 });
    }

    // 调用 DirectorEngine 核心引擎进行风格分析、剧本拆解与规则生成
    const storyboard = await engine.generateStoryboard(script, video);
    
    return NextResponse.json({ status: 'success', data: storyboard });
  } catch (error: any) {
    console.error('Generation Error:', error);
    return NextResponse.json({ error: error.message || '生成分镜失败' }, { status: 500 });
  }
}

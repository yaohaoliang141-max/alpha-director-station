import OpenAI from 'openai';

export interface VideoStyleReport {
  aesthetic: string;
  camera_movement: string;
  shot_sizes: string;
  rhythm: string;
}

export interface ShotPrompt {
  id: number;
  text_segment: string;
  shot_size: string;
  camera_movement: string;
  layering_depth: string;
  jimeng_prompt: string;
}

export class DirectorEngine {
  private getClient() {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      throw new Error("请在 .env.local 中配置 DASHSCOPE_API_KEY");
    }
    // 强制指定兼容 OpenAI 的接口地址
    return new OpenAI({
      apiKey: apiKey,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });
  }

  async extractStyle(videoFile: File): Promise<VideoStyleReport> {
    const client = this.getClient();
    let uploadedFileId = "";
    
    try {
      // 步骤 1：利用官方兼容接口直接上传视频 File 对象
      const uploadRes = await client.files.create({
        file: videoFile,
        purpose: "file-extract" as any // 绕过类型校验强传
      });
      uploadedFileId = uploadRes.id;
      
      const prompt = `你是一个专业的导演。请仔细观看上传的这段视频，并生成一个具有电影级质感的视听风格报告。
请返回如下严格的 JSON 格式（不要包含任何 Markdown 符号，直接返回 JSON 对象）：
{
  "aesthetic": "描述一种特定的视觉美学（例如：冷色调赛博朋克、暖色调日系清新等）",
  "camera_movement": "描述核心运镜模式（例如：大量使用手持平摇、极缓推镜头）",
  "shot_sizes": "描述常用景别",
  "rhythm": "剪辑节奏特征"
}`;

      // 步骤 2：调用 qwen-vl-max 视觉大模型进行多模态视频解析
      const response = await client.chat.completions.create({
        model: "qwen-vl-max",
        messages: [
          {
            role: "user",
            content: [
              { type: "video" as any, video: `fileid://${uploadedFileId}` },
              { type: "text", text: prompt }
            ]
          }
        ],
        // Qwen API 返回 JSON Object 需要这个约束
        response_format: { type: "json_object" }
      } as any);

      const text = response.choices[0].message.content || "{}";
      return JSON.parse(text) as VideoStyleReport;
    } catch (e: any) {
      console.error("Style Extraction Error:", e);
      throw new Error("通义千问视频解析失败：" + (e.message || "未知错误"));
    }
  }

  segmentScript(script: string): string[] {
    const sentences = script.replace(/\n/g, '。').split('。');
    const segments: string[] = [];
    let currentSeg = "";
    for (const s of sentences) {
      if (!s.trim()) continue;
      if (currentSeg.length + s.length > 50) {
        segments.push(currentSeg);
        currentSeg = s + "。";
      } else {
        currentSeg += s + "。";
      }
    }
    if (currentSeg) segments.push(currentSeg);
    return segments;
  }

  async generateStoryboard(script: string, videoFile: File): Promise<ShotPrompt[]> {
    const style = await this.extractStyle(videoFile);
    const segments = this.segmentScript(script);
    
    const prompts: ShotPrompt[] = [];
    let prevShotSize = "无";
    const client = this.getClient();
    
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      
      const prompt = `你是一个专业且要求极高的电影级导演。请将以下剧本切片转为一段 15 秒长度的高质量 AI 视频生成提示词。
【视觉风格基调】美学：${style.aesthetic}
【上一镜提示】景别：${prevShotSize}。当前 15 秒镜头的起幅必须与上一镜头无缝衔接连贯，严禁远景直跳特写，必须有平滑的过渡逻辑。
【剧情切片】：${seg}

核心要求：
1. **时间精细切分**：15 秒的镜头内必须包含运动变化，具体到每 2-5 秒一次视觉焦点或状态描述（如：0-3秒...，3-8秒...，8-15秒...）。
2. **多重运镜组合**：在这 15 秒内，运镜模式必须发生变化组合（例如从“缓慢推进”自然过渡到“环绕摇移”），不可从头到尾只有一个运镜。
3. **环境细节与衔接**：必须包含极度详细的背景场景描述（光线角度、空气中的微尘质感、环境物体的微动等）。第一段描述必须明确指出画面是如何从上一镜顺滑衔接切换过来的。
4. **字数要求**：jimeng_prompt 提示词必须是一段极其详尽的画面白描，字数要求在 200 字左右，使用电影工业术语。

请返回严格的 JSON 格式（不要包含任何 Markdown 符号，必须纯 JSON 对象）：
{
  "shot_size": "起幅景别 (远景、全景、中景、近景或特写)",
  "camera_movement": "15秒运镜组合 (如：静止->缓慢推镜头->左摇)",
  "layering_depth": "空间与层次描述",
  "jimeng_prompt": "不少于 200 字的详细提示词，包含上一镜衔接处理、时间切分的运镜变化、极细致的背景描述以及剧本情节。"
}`;

      try {
        // 步骤 3：调用 qwen-max 处理分镜逻辑生成
        const response = await client.chat.completions.create({
          model: "qwen-max",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });
        
        const text = response.choices[0].message.content || "{}";
        const data = JSON.parse(text);
        
        prompts.push({
          id: i + 1,
          text_segment: seg,
          shot_size: data.shot_size || "中景",
          camera_movement: data.camera_movement || style.camera_movement,
          layering_depth: data.layering_depth || "景深明确",
          jimeng_prompt: data.jimeng_prompt || `电影级画质，${style.aesthetic}，${seg}`
        });
        prevShotSize = data.shot_size || "中景";
      } catch (e) {
        console.error("Shot generation error:", e);
        // 超时或失败时做安全兜底
        prompts.push({
          id: i + 1,
          text_segment: seg,
          shot_size: "中景",
          camera_movement: style.camera_movement,
          layering_depth: "景深明确",
          jimeng_prompt: `电影级画质，${style.aesthetic}，中景，${style.camera_movement}。画面中：${seg.slice(0, 15)}...`
        });
      }
    }
    
    return prompts;
  }
}

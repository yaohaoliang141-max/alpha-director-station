'use client'

import { useState } from 'react'
import { create } from 'zustand'

// Zustand Store
interface DirectorState {
  script: string
  setScript: (s: string) => void
  video: File | null
  setVideo: (f: File | null) => void
  prompts: any[]
  setPrompts: (p: any[]) => void
}

const useStore = create<DirectorState>((set) => ({
  script: '',
  setScript: (script) => set({ script }),
  video: null,
  setVideo: (video) => set({ video }),
  prompts: [],
  setPrompts: (prompts) => set({ prompts })
}))

export default function AIDirectorStation() {
  const { script, setScript, video, setVideo, prompts, setPrompts } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [statusText, setStatusText] = useState('')

  const handleGenerate = async () => {
    if (!script || !video) return alert("请先填写剧本并上传参考样片")
    
    setIsLoading(true)
    setStatusText('正在解析样片光影...')
    
    const formData = new FormData()
    formData.append('script', script)
    formData.append('reference_video', video)

    try {
      // 模拟多阶段加载动画
      setTimeout(() => setStatusText('正在拆解剧本...'), 1500)
      setTimeout(() => setStatusText('正在执行运镜规则...'), 3000)

      const res = await fetch('/api/direct', {
        method: 'POST',
        body: formData
      })
      
      const responseData = await res.json()
      if (res.ok && responseData.data) {
        setPrompts(responseData.data)
      } else {
        alert(responseData.error || '生成失败，请检查后端服务')
        setPrompts([])
      }
    } catch (e) {
      alert('网络请求失败，请检查服务是否开启')
      setPrompts([])
    } finally {
      setIsLoading(false)
      setStatusText('')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans p-8 md:p-16 flex flex-col lg:flex-row gap-16 selection:bg-gray-200">
      
      {/* 左侧：极简输入区 */}
      <div className="flex-1 flex flex-col gap-8 max-w-2xl">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">AI 导演工作站</h1>
          <p className="text-gray-400 text-sm tracking-wide">Script-to-Shot Architect</p>
        </div>
        
        <textarea 
          className="w-full h-96 p-8 bg-gray-50 rounded-3xl outline-none resize-none text-lg leading-relaxed placeholder-gray-300 focus:bg-gray-100 transition-colors"
          placeholder="在此粘贴你的故事或剧本文本..."
          value={script}
          onChange={(e) => setScript(e.target.value)}
        />

        <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded-3xl">
          <div className="flex items-center gap-6">
            <label className="cursor-pointer px-6 py-3 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] rounded-full text-sm font-medium hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
              {video ? '重新上传样片' : '上传样片'}
              <input 
                type="file" 
                accept="video/mp4" 
                className="hidden" 
                onChange={(e) => setVideo(e.target.files?.[0] || null)}
              />
            </label>
            <span className="text-sm text-gray-400 truncate max-w-[200px]">
              {video ? video.name : '未选择 .mp4 文件'}
            </span>
          </div>
          {video && (
            <div className="relative w-full rounded-2xl overflow-hidden bg-black/5 shadow-sm">
              <video 
                src={URL.createObjectURL(video)} 
                controls 
                className="w-full h-48 object-contain"
              />
            </div>
          )}
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-5 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-900 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex justify-center items-center"
        >
          {isLoading ? (
            <span className="animate-pulse">{statusText}</span>
          ) : (
            '生成分镜提示词'
          )}
        </button>
      </div>

      {/* 右侧：结果展示区 */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-10">
        {(!prompts || prompts.length === 0) && !isLoading && (
          <div className="h-full flex items-center justify-center text-gray-300 text-lg">
            等待输入视听指令
          </div>
        )}
        
        {(prompts || []).map((prompt) => (
          <div key={prompt.id} className="p-8 bg-gray-50 rounded-3xl group relative transition-transform hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                Shot {String(prompt.id).padStart(2, '0')} • 15s
              </span>
              <button 
                onClick={() => copyToClipboard(prompt.jimeng_prompt)}
                className="opacity-0 group-hover:opacity-100 px-5 py-2 bg-black text-white text-xs rounded-full transition-opacity active:scale-95"
              >
                复制提示词
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="flex gap-3">
                <span className="px-4 py-1.5 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm">{prompt.shot_size}</span>
                <span className="px-4 py-1.5 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm">{prompt.camera_movement}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed border-l-[3px] border-gray-200 pl-4">
                {prompt.text_segment}
              </p>
              <p className="text-lg font-medium leading-relaxed text-black/90">
                {prompt.jimeng_prompt}
              </p>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  )
}

/**
 * API相关类型定义
 */

export interface GenerateImageParams {
  model: string;
  prompt: string;
  sieze: string;
  outputCount: number;
}

export interface GenerateImageToImageParams {
  model: string;
  prompt?: string;
  imageUrl: string;
  outputCount: number;
  styleIndex?: number;
}

export interface GenerateVideoParams {
  model: string;
  prompt: string;
  resolution: string;
  duration?: number;
}

export interface ImageToVideoParams {
  model: string;
  prompt: string;
  imageUrl: string;
  resolution: string;
  duration: number;
}

export interface VideoToVideoParams {
  model: string;
  video_url: string;
  style: number;
  video_fps: number;
}

export interface GeneratedImage {
  id: number;
  src: string;
}

export interface GeneratedVideo {
  id: number;
  src: string;
  taskId?: string;
}

export interface VideoGenerationResponse {
  output: {
    video_url: string;
    task_id: string;
  };
}

export interface VideoGenerationResponse2 {
  output: {
    output_video_url: string;
    task_id: string;
  };
}

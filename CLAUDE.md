# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm dev` (uses pnpm as package manager)
- **Build**: `pnpm build`
- **Production**: `pnpm start`
- **Lint**: `pnpm lint`

## Environment Setup

Requires a `.env.local` file with:
```
DASHSCOPE_API_KEY=your_dashscope_api_key_here
```

## Architecture Overview

This is a Next.js 15 AI video/image generation platform with simplified architecture:

### Core Structure
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with relaxed `@typescript-eslint/no-explicit-any` rule
- **Styling**: Tailwind CSS v4 with Radix UI components
- **State Management**: Zustand (simplified with direct function exports)
- **Package Manager**: pnpm (with specific overrides for vm2, coffee-script security)

### Feature Pages (App Router)
Five main generation features under `src/app/`:
- `text-to-image/` - Text to image generation
- `image-to-image/` - Image transformation
- `text-to-video/` - Text to video generation
- `image-to-video/` - Image to video conversion
- `video-to-video/` - Video style transformation

### State Management (Zustand)
- **Location**: `src/store/store.ts`
- **Usage**: `const { user, isLoading, setLoading } = useGlobalStore()`
- **Simplified**: Direct function exports, no wrapper classes

### API Architecture (Simplified)
- **Single Service File**: `src/lib/apiService.ts` - Contains all API logic
- **Direct Functions**: No class wrapper, direct function exports
- **Unified Configuration**: `src/config/index.ts` - All config in one file
- **Proxy Pattern**: All external API calls go through `/api/proxy` route
- **Async Tasks**: Simple polling pattern for AI generation tasks

### Component Structure (Simplified)
- **UI Components**: `src/components/ui/` - Radix UI based components
- **Feature Components**: Direct use of UI components, no intermediate "mol" layer
- **File Upload**: Specialized video/image upload components with validation

### File Upload & Storage
- **Qiniu Integration**: `src/lib/qiniuService.ts` for cloud storage
- **Upload API**: `/api/upload` and `/api/qiniu/token` routes
- **Validation**: Strict file format, size, and duration validation for videos

### Configuration System (Simplified)
- **Single Config**: `src/config/index.ts` with all constants and API endpoints
- **Type Safety**: Full TypeScript definitions in `src/types/`

### Error Handling & UX
- **Error Boundary**: Global error catching with `src/components/error-boundary.tsx`
- **Global Loading**: Centralized loading states via `src/components/ui/global-loading.tsx`
- **Real-time Feedback**: Upload progress and status visualization

## Development Patterns

### API Calls
Always use direct function imports:
```typescript
import { generateImage, pollTaskStatus } from '@/lib/apiService'
```

### State Updates
Use Zustand hooks directly:
```typescript
const { setLoading, setError } = useGlobalStore()
```

### File Uploads
Use the upload components directly:
```typescript
import { VideoUploadMol } from '@/components/mol/videoUploadMol'
```

### Configuration
Import from single config file:
```typescript
import { APP_CONFIG, getApiEndpoint } from '@/config'
```

## Testing

No specific test framework configured - check with user before implementing tests.
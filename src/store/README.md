# Zustand 状态管理

本项目使用 [Zustand](https://zustand-demo.pmnd.rs/) 进行状态管理，替代了之前的 React Context + useReducer 方案。

## 优势

- **轻量级**: 无需复杂的 Provider 包装组件
- **类型安全**: 完整的 TypeScript 支持
- **性能优化**: 自动优化重新渲染
- **开发工具**: 内置 Redux DevTools 支持
- **简单直观**: API 简洁，易于理解和使用

## 基本用法

### 使用全局状态

```typescript
import { useGlobalStore } from '@/store';

// 在组件中使用
function MyComponent() {
  const { user, isLoading, setLoading } = useGlobalStore();

  return <div>{isLoading ? '加载中...' : user?.name}</div>;
}
```

### 更新状态

```typescript
import { useGlobalStore } from '@/store';

function MyComponent() {
  const { setUser, setLoading, setError, clearError } = useGlobalStore();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginAPI();
      setUser(user);
    } catch (error) {
      setError('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return <button onClick={handleLogin}>登录</button>;
}
```

## 状态结构

```typescript
interface GlobalState {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;

  // 应用状态
  isLoading: boolean;
  error: string | null;

  // UI状态
  sidebarOpen: boolean;
}
```

## 可用 Hooks

### 基础 Hook

```typescript
const useGlobalStore = () => useGlobalStore();
```

### 选择器 Hooks (性能优化)

```typescript
const useUser = () => useGlobalStore(state => state.user);
const useIsLoading = () => useGlobalStore(state => state.isLoading);
const useError = () => useGlobalStore(state => state.error);
const useSidebarOpen = () => useGlobalStore(state => state.sidebarOpen);
```

### 动作 Hooks

```typescript
const useGlobalActions = () => {
  const { setUser, setLoading, setError, clearError, toggleSidebar, setSidebar } = useGlobalStore();
  return { setUser, setLoading, setError, clearError, toggleSidebar, setSidebar };
};
```

## 开发工具支持

Zustand 默认启用了 Redux DevTools 支持，你可以在浏览器开发者工具中查看状态变化：

1. 打开浏览器开发者工具
2. 切换到 Redux 标签页
3. 查看状态变化和动作历史

## 迁移指南

### 从 Context + useReducer 迁移

**之前:**

```typescript
// Context
const { state, dispatch } = useGlobalState();
dispatch({ type: 'SET_LOADING', payload: true });

// Reducer
case 'SET_LOADING':
  return { ...state, isLoading: action.payload };
```

**现在:**

```typescript
// Zustand
const { isLoading, setLoading } = useGlobalStore();
setLoading(true);
```

## 最佳实践

1. **使用选择器优化性能**: 对于大型组件，使用选择器只订阅需要的状态
2. **避免过度抽象**: 保持状态更新逻辑简单直接
3. **合理分组**: 将相关状态和动作放在一起
4. **类型安全**: 充分利用 TypeScript 的类型检查

## 扩展状态

如需添加新的状态，请在 `store.ts` 中：

1. 更新 `GlobalState` 接口
2. 添加对应的动作函数
3. 更新 `useGlobalStore` 的实现

```typescript
interface GlobalState {
  // ... 现有状态
  newFeature: boolean;
}

interface GlobalStore extends GlobalState {
  // ... 现有动作
  setNewFeature: (value: boolean) => void;
}

// 在 store 中实现
setNewFeature: newFeature => set({ newFeature });
```

interface SidebarProgressBarProps {
  status: {
    is_indexing: boolean;
    progress: number;
    total: number;
    processed: number;
  };
  isCollapsed: boolean;
}

export default function SidebarProgressBar({ status, isCollapsed }: SidebarProgressBarProps) {
  if (!status.is_indexing) return null;

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
      {!isCollapsed && (
        <>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Indexando arquivos...
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {status.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${status.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {status.processed} / {status.total} arquivos
          </p>
        </>
      )}
      {isCollapsed && (
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

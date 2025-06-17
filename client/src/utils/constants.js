export const CONTEST_HISTORY_FILTERS = [
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
  { value: '365days', label: 'Last 365 Days' },
]

export const PROBLEM_DATA_FILTERS = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
]

export const DEFAULT_CRON_TIME = '02:00' // Default is 2 AM
export const DEFAULT_CRON_FREQUENCY = 'daily'

export const CRON_FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' }
]

export const SUBMISSION_STATUS = {
  OK: 'OK',
  WRONG_ANSWER: 'WRONG_ANSWER',
  TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
  MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  COMPILATION_ERROR: 'COMPILATION_ERROR',
  SKIPPED: 'SKIPPED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED'
}

export const SUBMISSION_STATUS_COLORS = {
  OK: 'green',
  WRONG_ANSWER: 'red',
  TIME_LIMIT_EXCEEDED: 'amber',
  MEMORY_LIMIT_EXCEEDED: 'amber',
  RUNTIME_ERROR: 'red',
  COMPILATION_ERROR: 'red',
  SKIPPED: 'gray',
  REJECTED: 'gray',
  FAILED: 'red'
}

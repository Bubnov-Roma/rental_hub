#!/bin/bash
# scripts/dev-tools.sh

# Fast pre-commit checks
function precommit() {
  echo "🔍 Running pre-commit checks..."
  
  # TypeScript checks
  npx tsc --noEmit --skipLibCheck
  
  if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found"
    return 1
  fi
  
  # Biome checks
  npx biome check --apply .
  
  if [ $? -ne 0 ]; then
    echo "❌ Biome linting errors found"
    return 1
  fi
  
  # Tests checks
  npx jest --passWithNoTests
  
  echo "✅ All checks passed!"
}

# 
generation component
function generate-component() {
  local name=$1
  local type=${2:-ui}
  
  mkdir -p "src/components/$type/$name"
  
  # Create component file
  cat > "src/components/$type/$name/$name.tsx" << EOF
import { cn } from '@/lib/utils'
import * as React from 'react'

export interface ${name}Props extends React.HTMLAttributes<HTMLDivElement> {
  // Props here
}

export function ${name}({ 
  className,
  ...props 
}: ${name}Props) {
  return (
    <div 
      className={cn(
        '${name.toLowerCase()}',
        className
      )}
      {...props}
    >
      ${name} Component
    </div>
  )
}
EOF
  
  # 
  create index file
  cat > "src/components/$type/$name/index.ts" << EOF
export * from './$name'
EOF
  
  # create style file
  cat > "src/components/$type/$name/$name.module.css" << EOF
.${name.toLowerCase()} {
  /* Styles here */
}
EOF
  
  echo "✅ Component $name created in src/components/$type/$name/"
}

# Dependencies check
function check-deps() {
  echo "📦 Checking dependencies..."
  npx npm-check-updates
  npx depcheck
}
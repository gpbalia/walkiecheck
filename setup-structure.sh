#!/bin/bash

# Create main app structure
mkdir -p app/noauth/{login,register,pricing}
mkdir -p app/auth/{dashboard,project/\[projectId\]/{crew,departments,walkies,archive,collaborators,report}}
mkdir -p components/{ui,layout,auth,dashboard}
mkdir -p lib
mkdir -p public
mkdir -p styles

# Create base files
touch app/layout.tsx
touch app/page.tsx

# NoAuth pages
touch app/noauth/login/page.tsx
touch app/noauth/register/page.tsx
touch app/noauth/pricing/page.tsx

# Auth layout and pages
touch app/auth/layout.tsx
touch app/auth/dashboard/page.tsx
touch app/auth/project/\[projectId\]/page.tsx

# Create lib files
touch lib/firebase.ts
touch lib/auth.ts
touch lib/stripe.ts
touch lib/firestore.ts

# Create middleware
touch middleware.ts 
# **App Name**: Casa Organizzata

## Core Features:

- Property Management: Allow users to create and manage multiple properties, structuring them into rooms and locations.
- Inventory Tracking: Enable users to add items with names, descriptions, photos, quantities, tags, and barcode/QR code support.
- Instant Search: Provide a real-time search functionality to quickly locate items, displaying their current hierarchical location and associated photos. Use FTS5 to provide suggestions as the user types.
- Offline Synchronization: Enable offline functionality with SQLite and FTS5 for local storage, and ensure data synchronization with Supabase when online, resolving conflicts using a CRDT-lite strategy.
- Label Generation: Generate and read labels (QR/Code128/EAN) for containers and items.
- AI-powered Smart Categorization: Implement an AI tool that suggests relevant categories or tags based on the item's name and description using natural language processing.
- User Roles and Permissions: Implement a basic multi-user control system with roles such as owner, editor, and viewer, each with varying levels of access and permissions per property.

## Style Guidelines:

- Primary color: Light HSL(210, 65%, 50%) blue (#359EFF) to suggest a tech product.
- Background color: Very light blue HSL(210, 20%, 95%) blue (#F0F7FF).
- Accent color: Violet HSL(270, 50%, 60%) (#9966FF) to give contrast and suggest the AI features in the app.
- Body and headline font: 'Inter' (sans-serif) for a modern, machined, objective, neutral look.
- Use minimalist icons to represent common items and locations.
- Clean and intuitive layout with clear hierarchy and easy navigation.
- Subtle animations for item transitions and search interactions to enhance user experience.
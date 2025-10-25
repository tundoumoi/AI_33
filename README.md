## Running the code to Run Project

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

# Cấu trúc Deliverables
└── 📁Billiard Management App
    └── 📁src
        └── 📁components
            └── 📁figma
                ├── ImageWithFallback.tsx
            └── 📁ui
            ├── BillDetailPanel.tsx
            ├── BillItemsTable.tsx
            ├── BillsListPanel.tsx
            ├── CloseBillModal.tsx
            ├── ConfirmVoidModal.tsx
            ├── DurationTicker.tsx
            ├── MoveTableModal.tsx
            ├── OpenTableModal.tsx
            ├── ProductPicker.tsx
            ├── TableCard.tsx
            ├── TableGrid.tsx
            ├── TotalsPanel.tsx
        └── 📁guidelines
            ├── Guidelines.md
        └── 📁services
            ├── storage.ts
        └── 📁styles
            ├── globals.css
        └── 📁types
            ├── index.ts
        └── 📁utils
            ├── calculations.ts
        ├── App.tsx
        ├── Attributions.md
        ├── index.css
        ├── main.tsx
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── vite.config.ts

# Prompt Workflow :

Prompt 1 : Sinh function theo yêu cầu 
               |
                --> Prompt 2 : Phân tích code
                               |
                                --> Prompt 3 : sin ma trận TestCase
                                               |
                                                --> Prompt 4 : Sinh Test code từ ma trận TestCase
                                                               |
                                                                --> Promt 5 : Mock UX/UI với các function đã tạo.
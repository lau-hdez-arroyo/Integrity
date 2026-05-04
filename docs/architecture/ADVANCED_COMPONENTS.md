# Advanced Components Documentation

## Point 3: Frontend Advanced Components

This section documents all advanced reusable components created for the INTEGRITY dashboard.

---

## 📦 Component Catalog

### 1. DataTable
**File**: `components/DataTable.jsx`

Advanced table component with built-in features:
- ✅ Sorting (ascending/descending)
- ✅ Filtering (search all columns)
- ✅ Pagination (configurable rows per page)
- ✅ Row selection
- ✅ Responsive design
- ✅ Loading states

**Usage**:
```jsx
import DataTable from '../components/DataTable';

const columns = [
  { id: 'id', label: 'ID', align: 'left' },
  { id: 'name', label: 'Project Name', align: 'left' },
  { id: 'status', label: 'Status', render: (value) => <Chip label={value} /> },
];

<DataTable
  columns={columns}
  data={projectsData}
  searchable={true}
  sortable={true}
  paginated={true}
  onRowClick={(row) => navigate(`/projects/${row.id}`)}
/>
```

**Props**:
- `columns`: Array of column definitions
- `data`: Array of row data
- `loading`: Show loading spinner
- `onRowClick`: Callback for row clicks
- `searchable`: Enable search
- `sortable`: Enable sorting
- `paginated`: Enable pagination
- `rowsPerPageOptions`: Pagination options
- `onSelectionChange`: Row selection callback

---

### 2. ExportData
**File**: `components/ExportData.jsx`

Export table data in multiple formats:
- 📄 CSV
- 📋 JSON
- 📊 TSV

**Usage**:
```jsx
import ExportData from '../components/ExportData';

<ExportData
  data={data}
  columns={columns}
  filename="projects_report"
  disabled={data.length === 0}
/>
```

**Props**:
- `data`: Array of data to export
- `columns`: Column definitions
- `filename`: Export file name (without extension)
- `disabled`: Disable export button

---

### 3. FilterBar
**File**: `components/FilterBar.jsx`

Collapsible filter panel with multiple criteria:
- ✅ Expandable/collapsible interface
- ✅ Multiple filter types (text, select, etc.)
- ✅ Apply/Clear buttons
- ✅ Active filter count badge

**Usage**:
```jsx
import FilterBar from '../components/FilterBar';

const filters = [
  { id: 'status', label: 'Status', type: 'text' },
  {
    id: 'severity',
    label: 'Severity',
    type: 'select',
    options: [
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
];

<FilterBar
  filters={filters}
  onApplyFilters={(activeFilters) => applyFilters(activeFilters)}
  onClearFilters={() => clearFilters()}
/>
```

**Props**:
- `filters`: Array of filter definitions
- `onApplyFilters`: Called when filters applied
- `onClearFilters`: Called when filters cleared

---

### 4. SearchBox
**File**: `components/SearchBox.jsx`

Debounced search input with clear button:
- ✅ Debouncing (configurable delay)
- ✅ Clear button
- ✅ Loading indicator
- ✅ Focus effects

**Usage**:
```jsx
import SearchBox from '../components/SearchBox';

<SearchBox
  placeholder="Search projects..."
  debounceMs={300}
  onSearch={(term) => searchProjects(term)}
  loading={searching}
/>
```

**Props**:
- `onSearch`: Callback with search term
- `placeholder`: Input placeholder text
- `debounceMs`: Debounce delay in milliseconds
- `loading`: Show loading indicator

---

### 5. FormField
**File**: `components/FormField.jsx`

Enhanced TextField with validation:
- ✅ Error states
- ✅ Helper text
- ✅ Character counter
- ✅ Pattern validation
- ✅ Max length enforcement
- ✅ Custom styling

**Usage**:
```jsx
import FormField from '../components/FormField';

<FormField
  label="Project Name"
  value={name}
  onChange={setName}
  error={nameError}
  helperText="Name is required"
  required={true}
  maxLength={100}
  pattern="^[a-zA-Z0-9\s-]*$"
/>
```

**Props**:
- `label`: Field label
- `value`: Input value
- `onChange`: Change callback
- `error`: Show error state
- `helperText`: Error message
- `required`: Required field indicator
- `type`: Input type (text, email, password, etc.)
- `maxLength`: Maximum characters
- `pattern`: Regex pattern for validation
- `multiline`: Allow multiple lines
- `rows`: Number of rows for multiline
- `select`: Dropdown select
- `options`: Options for select
- `disabled`: Disable field

---

### 6. Modal
**File**: `components/Modal.jsx`

Enhanced Dialog component:
- ✅ Custom styling
- ✅ Header with close button
- ✅ Flexible content
- ✅ Action buttons
- ✅ Backdrop blur effect

**Usage**:
```jsx
import Modal from '../components/Modal';

<Modal
  open={openModal}
  title="Create Project"
  onClose={() => setOpenModal(false)}
  actions={[
    <Button onClick={() => setOpenModal(false)}>Cancel</Button>,
    <Button variant="contained" onClick={handleCreate}>Create</Button>,
  ]}
>
  <FormField label="Project Name" {...formProps} />
</Modal>
```

**Props**:
- `open`: Show/hide modal
- `onClose`: Close callback
- `title`: Modal title
- `children`: Modal content
- `actions`: Action buttons
- `maxWidth`: Max width (sm, md, lg, xl)
- `fullWidth`: Full width flag
- `size`: Size variant

---

### 7. Tooltip
**File**: `components/Tooltip.jsx`

Enhanced Tooltip with custom styling:
- ✅ Dark theme
- ✅ Arrow indicator
- ✅ Custom placement
- ✅ Delay control

**Usage**:
```jsx
import Tooltip from '../components/Tooltip';

<Tooltip title="Click to view details" placement="top">
  <IconButton>
    <InfoIcon />
  </IconButton>
</Tooltip>
```

**Props**:
- `title`: Tooltip text
- `placement`: Position (top, bottom, left, right, etc.)
- `arrow`: Show arrow
- `enterDelay`: Delay before showing
- `leaveDelay`: Delay before hiding
- `onClick`: Click handler

---

### 8. RangeSlider
**File**: `components/RangeSlider.jsx`

Dual-input range selector:
- ✅ Min/max values
- ✅ Custom step
- ✅ Marks support
- ✅ Value display

**Usage**:
```jsx
import RangeSlider from '../components/RangeSlider';

<RangeSlider
  label="Quality Score Range"
  min={0}
  max={100}
  value={[60, 95]}
  onChange={(newValue) => setQualityRange(newValue)}
/>
```

**Props**:
- `label`: Slider label
- `min`: Minimum value
- `max`: Maximum value
- `value`: Current range [min, max]
- `onChange`: Change callback
- `step`: Step increment
- `marks`: Show marks

---

### 9. PaginationControls
**File**: `components/PaginationControls.jsx`

Advanced pagination with goto:
- ✅ First/Previous/Next/Last
- ✅ Go to specific page
- ✅ Item count display
- ✅ Disabled state for edges

**Usage**:
```jsx
import PaginationControls from '../components/PaginationControls';

<PaginationControls
  currentPage={page}
  totalPages={Math.ceil(total / itemsPerPage)}
  totalItems={total}
  itemsPerPage={itemsPerPage}
  onPageChange={(newPage) => setPage(newPage)}
/>
```

**Props**:
- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `onPageChange`: Page change callback
- `itemsPerPage`: Items per page
- `totalItems`: Total items

---

### 10. ConfirmDialog
**File**: `components/ConfirmDialog.jsx`

Confirmation modal with severity levels:
- ✅ Warning/Error/Info/Success
- ✅ Custom messages
- ✅ Loading state
- ✅ Semantic icons

**Usage**:
```jsx
import ConfirmDialog from '../components/ConfirmDialog';

<ConfirmDialog
  open={showConfirm}
  title="Delete Project?"
  message="This action cannot be undone."
  severity="error"
  onConfirm={() => deleteProject()}
  onCancel={() => setShowConfirm(false)}
  confirmText="Delete"
  loading={deleting}
/>
```

**Props**:
- `open`: Show/hide dialog
- `title`: Dialog title
- `message`: Confirmation message
- `onConfirm`: Confirm callback
- `onCancel`: Cancel callback
- `severity`: Alert type (warning, error, info, success)
- `confirmText`: Confirm button text
- `cancelText`: Cancel button text
- `loading`: Show loading state

---

## 🔗 Integration Examples

### Complete Dashboard with All Components

```jsx
import React, { useState } from 'react';
import { Box, Button, Container } from '@mui/material';
import DataTable from '../components/DataTable';
import FilterBar from '../components/FilterBar';
import SearchBox from '../components/SearchBox';
import ExportData from '../components/ExportData';
import Modal from '../components/Modal';
import FormField from '../components/FormField';

export default function ProjectsPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ name: '', status: '' });

  const columns = [
    { id: 'name', label: 'Project Name' },
    { id: 'status', label: 'Status' },
    { id: 'created', label: 'Created' },
  ];

  const filters = [
    { id: 'status', label: 'Status', type: 'select', options: [...] },
  ];

  const handleApplyFilters = (activeFilters) => {
    const filtered = data.filter(item => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        return item[key] === value;
      });
    });
    setFiltered(filtered);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <SearchBox onSearch={(term) => console.log(term)} />
        <ExportData data={filtered} columns={columns} filename="projects" />
        <Button onClick={() => setOpenModal(true)}>New Project</Button>
      </Box>

      <FilterBar filters={filters} onApplyFilters={handleApplyFilters} />

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(row) => console.log(row)}
      />

      <Modal
        open={openModal}
        title="Create Project"
        onClose={() => setOpenModal(false)}
        actions={[
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>,
          <Button variant="contained">Create</Button>,
        ]}
      >
        <FormField label="Name" value={form.name} onChange={(v) => setForm({...form, name: v})} />
      </Modal>
    </Container>
  );
}
```

---

## 🎯 Best Practices

1. **Search + Filter Combination**
   - Use SearchBox for quick keyword search
   - Use FilterBar for advanced criteria

2. **Export Timing**
   - Export filtered/sorted data when applied
   - Show count of exported items

3. **Modal Forms**
   - Use FormField for all inputs
   - Validate before submission
   - Show loading state during submit

4. **Pagination**
   - Always show item count
   - Disable buttons at boundaries
   - Remember page on filter change

5. **Tooltips**
   - Use for help icons and info
   - Keep text short (< 100 chars)
   - Use on hover, not default

---

## 🚀 Performance Tips

1. **Memoize Callbacks**
   ```jsx
   const handleFilterChange = useCallback((filters) => {
     applyFilters(filters);
   }, []);
   ```

2. **Lazy Load Large Tables**
   ```jsx
   const [page, setPage] = useState(0);
   const displayData = useMemo(() => {
     return data.slice(page * 10, (page + 1) * 10);
   }, [data, page]);
   ```

3. **Debounce Search**
   - SearchBox already debounces (300ms default)
   - Adjust `debounceMs` prop as needed

4. **Virtualize Long Lists**
   - For 1000+ items, consider react-window
   - Or paginate with PaginationControls

---

## 📝 Component Checklist

- [x] DataTable - Sorting, filtering, pagination
- [x] ExportData - CSV, JSON, TSV export
- [x] FilterBar - Collapsible advanced filters
- [x] SearchBox - Debounced search
- [x] FormField - Validation and formatting
- [x] Modal - Enhanced dialog
- [x] Tooltip - Custom styled tooltips
- [x] RangeSlider - Dual range input
- [x] PaginationControls - Advanced pagination
- [x] ConfirmDialog - Confirmation modal

All components are production-ready and fully styled!

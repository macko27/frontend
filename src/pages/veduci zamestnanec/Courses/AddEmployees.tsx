import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { EmployeeCard } from '../../../types/EmployeeCard';


interface EmployeeSelectionDialogProps {
  employees: EmployeeCard[];
  selectedEmployees: string[];
  onClose: () => void;
  onSave: (selected: string[]) => void;
}

const EmployeeSelectionDialog: React.FC<EmployeeSelectionDialogProps> = ({ employees, selectedEmployees, onClose, onSave }) => {
  const [selected, setSelected] = useState(selectedEmployees);

  const handleSelect = (employeeId: string) => {
    if (selected.includes(employeeId)) {
      setSelected(selected.filter(id => id !== employeeId));  // Remove from selected
    } else {
      setSelected([...selected, employeeId]);  // Add to selected
    }
  };

  const handleSave = () => {
    onSave(selected);  // Return selected employees
    onClose();  // Close the dialog
  };

  const columns:GridColDef[] = [
    { field: 'name', headerName: 'Meno zamestnanca', width: 250 },
    { field: 'department', headerName: 'Oddelenie', width: 200 },
    {
      field: 'select',
      headerName: 'Vybrať',
      renderCell: (params) => (
            <Stack direction="column" sx={{ float: "center", marginInline: "3" }}>
                <Button
                variant={selected.includes(params.row.id) ? "contained" : "outlined"}
                color="primary"
                onClick={() => handleSelect(params.row.id)}
                >
                {selected.includes(params.row.id) ? "Vybraný" : "Vybrať"}
                </Button>
            </Stack>
      ),
      width: 100,
    },
  ];

  const rows = employees.map(emp => ({
    id: emp.employeeId,
    name: emp.name,
    department: emp.department,
  }));

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Vyhľadávanie zamestnancov</DialogTitle>
      <DialogContent>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
            checkboxSelection={false}
            disableRowSelectionOnClick
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary">
          Zavrieť
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeSelectionDialog;
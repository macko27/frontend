export const dataGridStyles = {
    "& .archived-row": {
        backgroundColor: "rgba(255, 0, 0, 0.1)", 
        "&:hover": {
            backgroundColor: "rgba(255, 0, 0, 0.2)",
        },
    },

    "& .notReaded-row": {
        backgroundColor: "rgba(169, 169, 169, 0.5)", 
        "&:hover": {
            backgroundColor: "rgba(169, 169, 169, 0.7)",
        },
    },
    "& .MuiDataGrid-cell": {
        borderRight: "2px solid #ccc",  
    },
    "& .header": {
        fontWeight: 'bold',
        fontSize: 16, 
        backgroundColor: "#FFD6B8",
    },
  };
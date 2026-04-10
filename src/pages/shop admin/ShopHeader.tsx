import { Box, TextField, IconButton, Button, Select, MenuItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import api from '../../app/api';
import { useSnackbar } from '../../hooks/SnackBarContext';
import ShopHeaderRight from "./ShopHeaderRight";

interface Props {
  points: number;
}


const ShopHeader: React.FC<Props> = ({ points }) => {
   const nav = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
        justifyContent: "space-between",
        gap: 2,
        p: 2,
        borderRadius: 3,
      }}
    >
      {/*ĽAVÁ ČASŤ*/}
      <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-start" } }}>
        <Button
          variant="contained"
          color="info"
          onClick={() => nav("/recognitions")}
          sx={{
            height: 40,
            borderRadius: 999,
            px: 2,
            minWidth: "auto",
            whiteSpace: "nowrap",
            fontSize: "0.8rem",
            textTransform: "none",
            width: { xs: "100%", md: "auto" },
          }}
        >
          Späť na uznania
        </Button>
      </Box>

     {/*STRED*/}
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  }}
>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      backgroundColor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: "999px",
      px: 1,
      height: 56,
      width: "100%",
      maxWidth: 520,
      overflow: "hidden",
    }}
  >
    {/* Hľadať sekcia */}
    <Box sx={{ flex: 1, px: 1.5, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Box sx={{ fontSize: "0.7rem", fontWeight: 600, color: "text.primary", lineHeight: 1 }}>
        Hľadať
      </Box>
      <TextField
        placeholder="Napíšte názov produktu"
        size="small"
        variant="standard"
        fullWidth
        InputProps={{ disableUnderline: true }}
        sx={{ "& input": { fontSize: "0.8rem", color: "text.secondary", p: 0, mt: 0.3 } }}
      />
    </Box>

    <Box sx={{ width: "1px", height: 28, backgroundColor: "divider", flexShrink: 0 }} />

    {/* Kategória sekcia */}
<Box sx={{ flex: 1, px: 1.5, display: "flex", flexDirection: "column", justifyContent: "center" }}>
  <Box sx={{ fontSize: "0.7rem", fontWeight: 600, color: "text.primary", lineHeight: 1 }}>
    Kategória
  </Box>
  <Select
    size="small"
    defaultValue=""
    variant="standard"
    disableUnderline
    displayEmpty
    renderValue={(value) =>
      value === "" ? (
        <span style={{ color: "inherit", opacity: 0.5 }}>Zvoľte kategóriu</span>
      ) : value === "1" ? "Elektronika" : "Darčeky"
    }
    sx={{
      fontSize: "0.8rem",
      color: "text.secondary",
      mt: 0.3,
      "& .MuiSelect-select": { p: 0 },
    }}
  >
    <MenuItem value="">Zvoľte kategóriu</MenuItem>
    <MenuItem value="1">Elektronika</MenuItem>
    <MenuItem value="2">Darčeky</MenuItem>
  </Select>
</Box>

    <IconButton size="small" sx={{ mx: 0.5 }} color="primary">
      <SearchIcon />
    </IconButton>
  </Box>
</Box>

      {/*PRAVÁ ČASŤ*/}
      <ShopHeaderRight
        points={points}
      />
    </Box>
  );
};

export default ShopHeader;
import { Box, TextField, IconButton, Button, Select, MenuItem } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import api from '../../app/api';
import { useSnackbar } from '../../hooks/SnackBarContext';

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
          onClick={() => nav("/shop")}
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
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
        }}
        >
            <Box
                sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1,
                width: "100%",
                maxWidth: 600,
                }}
            >

                <TextField
                placeholder="Napíšte názov produktu"
                size="small"
                fullWidth
                />

                <Select size="small" defaultValue="" sx={{ minWidth: 150 }}>
                <MenuItem value="">Zvoľte kategóriu</MenuItem>
                <MenuItem value="1">Elektronika</MenuItem>
                <MenuItem value="2">Darčeky</MenuItem>
                </Select>

                <IconButton color="primary">
                <SearchIcon />
                </IconButton>
            </Box>
      </Box>

      {/*PRAVÁ ČASŤ*/}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "space-between", md: "flex-end" },
          alignItems: "center",
          gap: 1,
          width: { xs: "100%", md: "auto" },
        }}
      >
        <IconButton>
          <ShoppingCartIcon />
        </IconButton>

        <IconButton>
          <Inventory2Icon />
        </IconButton>

        {/* Body */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 999,
            boxShadow: 1,
          }}
        >
          <MonetizationOnIcon color="warning" />
          <span>{points}</span>
        </Box>
      </Box>
    </Box>
  );
};

export default ShopHeader;
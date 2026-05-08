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
  employeeId: string;
  searchName: string;
  setSearchName: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  priceFrom: string;
  setPriceFrom: (v: string) => void;
  priceTo: string;
  setPriceTo: (v: string) => void;
  onSearch: () => void;
}


const ShopHeader: React.FC<Props> = ({ points, employeeId, searchName, setSearchName, categoryId, setCategoryId, priceFrom, setPriceFrom, priceTo, setPriceTo, onSearch }) => {
    const nav = useNavigate();
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
      api.get("/Shop/GetAllCategories")
        .then(res => setCategories(res.data))
        .catch(() => {
          // snackbar
        });
    }, []);

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
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
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
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                sx={{
                  fontSize: "0.8rem",
                  color: "text.secondary",
                  mt: 0.3,
                  "& .MuiSelect-select": { p: 0 },
                }}
              >
                <MenuItem value="">Zvoľte kategóriu</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>


            <Box sx={{ width: "1px", height: 28, backgroundColor: "divider", flexShrink: 0 }} />

            {/* Cena od sekcia */}
            <Box sx={{ flex: 0.8, px: 1.5, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Box sx={{ fontSize: "0.7rem", fontWeight: 600, color: "text.primary", lineHeight: 1 }}>
                Cena od
              </Box>
              <TextField
                placeholder="Min. body"
                size="small"
                variant="standard"
                fullWidth
                type="number"
                InputProps={{ disableUnderline: true }}
                sx={{
                  "& input": { fontSize: "0.8rem", color: "text.secondary", p: 0, mt: 0.3 },
                  "& input[type=number]": { MozAppearance: "textfield" },
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { WebkitAppearance: "none" },
                }}
                value={priceFrom}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setPriceFrom(value);
                }}
              />
            </Box>

            <Box sx={{ width: "10px", height: "1px", backgroundColor: "divider", flexShrink: 0, marginRight: 2, marginTop: 1 }} />

            {/* Cena do sekcia */}
            <Box sx={{ flex: 0.8, px: 1.5, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Box sx={{ fontSize: "0.7rem", fontWeight: 600, color: "text.primary", lineHeight: 1 }}>
                Cena do
              </Box>
              <TextField
                placeholder="Max. body"
                size="small"
                variant="standard"
                fullWidth
                type="number"
                InputProps={{ disableUnderline: true }}
                sx={{
                  "& input": { fontSize: "0.8rem", color: "text.secondary", p: 0, mt: 0.3 },
                  "& input[type=number]": { MozAppearance: "textfield" },
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": { WebkitAppearance: "none" },
                }}
                value={priceTo}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setPriceTo(value);
                }}
              />
            </Box>


            <IconButton size="small" sx={{ mx: 0.5 }} color="primary" onClick={onSearch}>
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

        {/*PRAVÁ ČASŤ*/}
        <ShopHeaderRight
          points={points}
          employeeId={employeeId}
        />
      </Box>
    );
};

export default ShopHeader;
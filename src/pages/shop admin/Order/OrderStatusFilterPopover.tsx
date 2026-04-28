import React, { useState } from "react";
import { Popover, Box, Button, FormControlLabel, Checkbox } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useTheme } from "@mui/material/styles";
import { Order } from "../../../types/Shop/Order";

type OrderStatusFilterPopoverProps = {
  filterCreated: boolean;
  filterConfirmed: boolean;
  filterSent: boolean;
  filterDelivered: boolean;
  filterCancelled: boolean;

  orders: Order[];

  setFilterCreated: (v: boolean) => void;
  setFilterConfirmed: (v: boolean) => void;
  setFilterSent: (v: boolean) => void;
  setFilterDelivered: (v: boolean) => void;
  setFilterCancelled: (v: boolean) => void;
};

const OrderStatusFilterPopover: React.FC<OrderStatusFilterPopoverProps> = ({
  filterCreated,
  filterConfirmed,
  filterSent,
  filterDelivered,
  filterCancelled,
  orders,
  setFilterCreated,
  setFilterConfirmed,
  setFilterSent,
  setFilterDelivered,
  setFilterCancelled,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const checkedCount = [filterCreated, filterConfirmed, filterSent, filterDelivered, filterCancelled].filter(Boolean).length;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const counts = {
    0: orders.filter(o => o.stav === 0).length,
    1: orders.filter(o => o.stav === 1).length,
    2: orders.filter(o => o.stav === 2).length,
    3: orders.filter(o => o.stav === 3).length,
    4: orders.filter(o => o.stav === 4).length,
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleOpen}
        sx={{
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.9rem",
            color: isDark ? "#e8e8e8" : "#3a3a3a",
            px: 2,
            py: 0.5,
            boxShadow: "none",
            borderColor: isDark ? "#e8e8e8" : "#3a3a3a",
        }}
        endIcon={<ArrowDropDownIcon />}
        >
        Stav objednávky
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1, minWidth: 220 }}>
          
          <FormControlLabel
            sx={{ width: "100%", mr: 0, "& .MuiFormControlLabel-label": { width: "100%" } }}
            control={
              <Checkbox
                checked={filterCreated}
                onChange={(e) => setFilterCreated(e.target.checked)}
                disabled={filterCreated && checkedCount === 1}
              />
            }
            label={
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Vytvorená</span>
                    <span>{counts[0]}</span>
                </Box>
            }
          />

          <FormControlLabel
            sx={{ width: "100%", mr: 0, "& .MuiFormControlLabel-label": { width: "100%" } }}
            control={
              <Checkbox
                checked={filterConfirmed}
                onChange={(e) => setFilterConfirmed(e.target.checked)}
                disabled={filterConfirmed && checkedCount === 1}
              />
            }
            label={
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Potvrdená</span>
                    <span>{counts[1]}</span>
                </Box>
            }
          />

          <FormControlLabel
            sx={{ width: "100%", mr: 0, "& .MuiFormControlLabel-label": { width: "100%" } }}
            control={
              <Checkbox
                checked={filterSent}
                onChange={(e) => setFilterSent(e.target.checked)}
                disabled={filterSent && checkedCount === 1}
              />
            }
            label={
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Odoslaná</span>
                    <span>{counts[2]}</span>
                </Box>
            }
          />

          <FormControlLabel
            sx={{ width: "100%", mr: 0, "& .MuiFormControlLabel-label": { width: "100%" } }}
            control={
              <Checkbox
                checked={filterDelivered}
                onChange={(e) => setFilterDelivered(e.target.checked)}
                disabled={filterDelivered && checkedCount === 1}
              />
            }
            label={
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Doručená</span>
                    <span>{counts[3]}</span>
                </Box>
            }
          />

          <FormControlLabel
            sx={{ width: "100%", mr: 0, "& .MuiFormControlLabel-label": { width: "100%" } }}
            control={
              <Checkbox
                checked={filterCancelled}
                onChange={(e) => setFilterCancelled(e.target.checked)}
                disabled={filterCancelled && checkedCount === 1}
              />
            }
            label={
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <span>Zrušená</span>
                    <span>{counts[4]}</span>
                </Box>
            }
          />

        </Box>
      </Popover>
    </>
  );
};

export default OrderStatusFilterPopover;
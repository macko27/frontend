// SurveyFilterPopover.tsx
import React, { useState } from "react";
import { Popover, Box, Button, FormControlLabel, Checkbox } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

type SurveyFilterPopoverProps = {
  filterActive: boolean;
  filterClosed: boolean;
  filterCancelled: boolean;
  filterInactive: boolean;
  setFilterActive: (value: boolean) => void;
  setFilterClosed: (value: boolean) => void;
  setFilterCancelled: (value: boolean) => void;
  setFilterInactive: (value: boolean) => void;
};

const SurveyFilterPopover: React.FC<SurveyFilterPopoverProps> = ({
  filterActive,
  filterClosed,
  filterCancelled,
  filterInactive,
  setFilterActive,
  setFilterClosed,
  setFilterCancelled,
  setFilterInactive
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
        <Button
            variant="contained"           // používa vlastné pozadie
            onClick={handleOpen}
            color="info"
            sx={{
                color: '#fff',
                textTransform: 'none',
            }}
            endIcon={<ArrowDropDownIcon />}
            >
            Filtrovanie
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
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1, minWidth: 180 }}>
            <FormControlLabel
                control={
                <Checkbox
                    color="info"
                    checked={filterActive}
                    onChange={(e) => setFilterActive(e.target.checked)}
                />
                }
                label="Aktívne ankety"
            />

            <FormControlLabel
                control={
                <Checkbox
                    color="info"
                    checked={filterClosed}
                    onChange={(e) => setFilterClosed(e.target.checked)}
                />
                }
                label="Uzavreté ankety"
            />

            <FormControlLabel
                control={
                    <Checkbox
                        color="info"
                        checked={filterCancelled}
                        onChange={(e) => setFilterCancelled(e.target.checked)}
                    />
                }
                label="Zrušené ankety"
                />

                <FormControlLabel
                control={
                    <Checkbox
                    color="info"
                    checked={filterInactive}
                    onChange={(e) => setFilterInactive(e.target.checked)}
                    />
                }
                label="Neaktívne ankety"
                />

            <Button
                variant="contained"
                size="small"
                color="info"
                onClick={handleClose}
            >
                Zobraziť ankety
            </Button>
            </Box>
        </Popover>
    </>
  );
};

export default SurveyFilterPopover;
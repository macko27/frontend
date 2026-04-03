import { Box, TextField, Button, Typography } from "@mui/material";
import Layout from "../../../components/Layout";

const ManageCategory: React.FC = () => {
   

    return (
        <Layout fullWidth={true}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Správa kategórií
                </Typography>
                <Typography variant="body1">
                    Tato stránka je určena pro správu kategorií v e-shopu. Zde můžete přidávat, upravovat nebo mazat kategorie produktů.
                </Typography>
            </Box>
        </Layout>
    );
};

export default ManageCategory;
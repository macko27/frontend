import { Box, Typography, Button, Divider } from "@mui/material";
import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";

interface QuestionResultProps {
  question: any;
  index: number;
}

const COLORS = ["#66bb6a", "#ffe082", "#ef5350", "#42a5f5"];

const QuestionResult: React.FC<QuestionResultProps> = ({ question, index }) => {
  const [selectedOption, setSelectedOption] = useState<{
    option: any;
    index: number;
    } | null>(null);

  const options = question.options.map((o: any) => ({ ...o }));
  const isSingle = question.answerType === "single";
  
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 6; // počet mien na stránku
  const voters = selectedOption?.option.voters || [];
  const totalPages = Math.ceil(voters.length / pageSize);
  const visibleVoters = voters.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const totalVotes = options.reduce((sum: number, o: any) => sum + o.votes, 0);
  const chartData = options.map((o: any) => ({
    name: o.answer,
    value: o.votes,
  }));

  return (
    <Box sx={{ mb: 5 }}>
      <Typography fontWeight="bold" sx={{ mb: 2 }}>
        Otázka {index + 1}: {question.question}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          alignItems: "flex-start",
        }}
      >
        {/* ĽAVÁ ČASŤ */}
        <Box sx={{
            flex: { xs: "1 1 100%", md: "2 2 0" },
            display: "flex", // dôležité
            flexDirection: { xs: "column", md: "column" },
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
        }}>
          {/* Graf */}
          <Box sx={{ width: 220, height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              {isSingle ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {chartData.map((entry: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip />
                  <Bar dataKey="value">
                    {chartData.map((entry: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                    <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(val) => `${val}`} // alebo `${val}%` ak chceš percentá
                        style={{ fill: "black", fontWeight: "bold" }}
                    />
                  </Bar>

                </BarChart>
              )}
            </ResponsiveContainer>
          </Box>

          {/* Legenda */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 3 }}>
            {options.map((o: any, i: number) => {
              const percent =
                totalVotes === 0
                  ? 0
                  : Math.round((o.votes / totalVotes) * 100);

              return (
                <Box
                  key={o.id}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3 }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: COLORS[i % COLORS.length],
                    }}
                  />

                  <Typography>Odpoveď č.{i + 1}</Typography>

                  <Typography fontWeight="bold">{percent} %</Typography>

                  <Button
                    variant="contained"
                    color="info"
                    size="small"
                    onClick={() => setSelectedOption({ option: o, index: i })}
                    sx={{ textTransform: "none" }}
                  >
                    Zobraziť hlasujúcich
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* PRAVÝ PANEL — LEN PRE TÚTO OTÁZKU */}
        {selectedOption && (
          <Box
            sx={{
                height: 300,
                maxWidth: 300,
                overflowY: "auto",
                mt: { xs: 0, md: 10 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
          >
            <Box sx={{ width: 2, bgcolor: "grey.400" }} />

            <Box sx={{ width: "100%" }}>
              <Typography fontWeight="bold" sx={{ mb: 2 }}>
                Hlasujúci – Odpoveď č. {selectedOption.index + 1}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 2 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                    {visibleVoters.length > 0 ? (
                    visibleVoters.map((v: any) => (
                        <Box
                        key={v.id}
                        sx={{
                            display: "inline-block",
                            bgcolor: "greenyellow",
                            color: "black",
                            px: 2,
                            py: 0.5,
                            borderRadius: "9999px",
                            fontSize: "1rem",
                            whiteSpace: "nowrap",
                        }}
                        >
                        {v.fullName}
                        </Box>
                    ))
                    ) : (
                    <Typography color="text.secondary">Nikto zatiaľ nehlasoval</Typography>
                    )}
                </Box>

                {/* Navigácia */}
                {voters.length > pageSize && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                        disabled={pageIndex === 0}
                        sx={{ textTransform: "none" }}
                    >
                        {"<"} Predošlí
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))}
                        disabled={pageIndex === totalPages - 1}
                        sx={{ textTransform: "none" }}
                    >
                        Ďalší {">"}
                    </Button>
                    </Box>
                )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setSelectedOption(null)}
                        sx={{ textTransform: "none" }}
                    >
                        Zavrieť
                    </Button>
                </Box>

            </Box>

          </Box>
        )}

      </Box>
    </Box>
  );
};

export default QuestionResult;
import { Box, Typography, DialogContent } from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Rectangle
} from "recharts";

const COLORS = ["#66bb6a", "#ffe082", "#ef5350", "#42a5f5"];

interface SurveyResultProps {
  survey: any;
}

const SurveyResultAnonymGraphs: React.FC<SurveyResultProps> = ({ survey }) => {
  return (
    <DialogContent sx={{ pt: 2 }}>
      {survey?.questions?.map((q: any, index: number) => {
        // pre anonymnú verziu môžeš tu upraviť dáta (napr. skryť mená)
        const options = q.options.map((o: any) => ({ ...o }));

        const isSingle = q.answerType === "single";

        const totalVotes = options.reduce((sum: number, o: any) => sum + o.votes, 0);
        const chartData = options.map((o: any) => ({ name: o.answer, value: o.votes }));

        return (
          <Box key={q.id} sx={{ mb: 5 }}>
            <Typography fontWeight="bold" sx={{ mb: 2 }}>
              Otázka {index + 1}: {q.question}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                alignItems: "flex-start",
                flexDirection: { xs: "column", md: "row" },
              }}
            >


            {/* GRAF PODĽA TYPU OTÁZKY */}
            <Box sx={{ width: 220, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
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
                        <Sector
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="value">
                      {chartData.map((entry: any, i: number) => (
                        <Rectangle
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Box>

              {/* Legenda */}
              <Box sx={{ flex: 1 }}>
                {options.map((o: any, i: number) => {
                  const percent =
                    totalVotes === 0 ? 0 : Math.round((o.votes / totalVotes) * 100);
                  return (
                    <Box
                      key={o.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: COLORS[i % COLORS.length],
                          }}
                        />
                        <Typography>{o.answer}</Typography>
                      </Box>
                      <Typography fontWeight="bold">{percent} %</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        );
      })}
    </DialogContent>
  );
}

export default SurveyResultAnonymGraphs;

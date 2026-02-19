import { Box, Typography, DialogContent } from "@mui/material";
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
  Rectangle,
  Sector
} from "recharts";

const COLORS = ["#66bb6a", "#ffe082", "#ef5350", "#42a5f5"];

interface SurveyResultProps {
  survey: any;
}

const SurveyResultNeanonymGraphs: React.FC<SurveyResultProps> = ({ survey }) => {
  return (
    <DialogContent sx={{ pt: 2 }}>
      {survey?.questions?.map((q: any, index: number) => {
        // pre neanonymnú verziu môžeš tu spracovať mená alebo ďalšie špecifiká
        const options = q.options; // zatiaľ rovnaké ako anonymná verzia

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
              {/* Pie Chart */}
              <Box sx={{ width: 220, height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      shape={(props: any) => {
                        const { index, ...rest } = props;
                            return (
                            <Sector
                                {...rest}
                                fill={COLORS[index % COLORS.length]}
                            />
                            );
                        }}
                    >
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Bar Chart */}
              <Box sx={{ flex: 1, minWidth: 250, height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar
                        dataKey="value"
                        shape={(props: any) => {
                        const { index, ...rest } = props;
                        return (
                            <Rectangle
                            {...rest}
                            fill={COLORS[index % COLORS.length]}
                            />
                        );
                        }}
                    />
                  </BarChart>
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

export default SurveyResultNeanonymGraphs;

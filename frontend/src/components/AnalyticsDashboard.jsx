import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Badge,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { RiFlashlightFill, RiTimeFill, RiPieChartFill, RiTimer2Fill } from "react-icons/ri";
import AnalyticsGraphs from "./AnalyticsGraphs";

function AnalyticsDashboard({ tasks, lastUpdated, user }) {
  const bgColor = "gray.800";
  const borderColor = "gray.700";

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "inprogress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const activeTasks = todoCount + inProgressCount;

  const completedWithDate = tasks.filter((t) => t.status === "done" && (t.completedAt || t.updatedAt));
  const avgLeadTimeDays =
    completedWithDate.length > 0
      ? (
        completedWithDate.reduce((acc, t) => {
          const created = new Date(t.createdAt || t.updatedAt);
          const completed = new Date(t.completedAt || t.updatedAt);
          return acc + Math.round((completed - created) / (24 * 60 * 60 * 1000));
        }, 0) / completedWithDate.length
      ).toFixed(1)
      : "—";

  const barData = [
    { name: "To Do", count: todoCount },
    { name: "In Progress", count: inProgressCount },
    { name: "Done", count: doneCount },
  ];

  const categories = ["feature", "bug", "enhancement", "design", "refactor", "documentation", "testing"];
  const performanceData = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const completed = catTasks.filter((t) => t.status === "done").length;
    return {
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      total: catTasks.length,
      completed,
      pct: catTasks.length ? Math.round((completed / catTasks.length) * 100) : 0,
      velocity: catTasks.length > 2 ? "High" : catTasks.length > 0 ? "Medium" : "Low",
    };
  }).filter((r) => r.total > 0);

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 5);

  const StatCard = ({ label, value, helpText, icon, color }) => (
    <Stat bg={bgColor} p={4} borderRadius="xl" border="1px" borderColor={borderColor} shadow="lg" _hover={{ borderColor: "brand.500", shadow: "xl" }} transition="all 0.2s">
      <Flex justify="space-between">
        <Box>
          <StatLabel color="gray.400">{label}</StatLabel>
          <StatNumber fontSize="2xl" color="white">{value}</StatNumber>
          <StatHelpText color="gray.500">
            {helpText}
          </StatHelpText>
        </Box>
        <Flex align="center" justify="center" bg={`${color}.900`} p={2} borderRadius="md" boxSize="10" color={`${color}.400`}>
          <Icon as={icon} boxSize={5} />
        </Flex>
      </Flex>
    </Stat>
  );

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="sm" color="gray.400" mb={1}>Dashboard / Analytics Overview</Text>
        <Heading size="lg" color="white">System Analytics</Heading>
      </Box>

      {/* Metrics Row */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          label="Total Active Tasks"
          value={activeTasks}
          helpText={<><StatArrow type="increase" /> 12% vs last month</>}
          icon={RiFlashlightFill}
          color="brand"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          helpText={<><StatArrow type="decrease" /> 4% vs last month</>}
          icon={RiTimeFill}
          color="accent"
        />
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          helpText={<><StatArrow type="increase" /> 8% vs last month</>}
          icon={RiPieChartFill}
          color="purple"
        />
        <StatCard
          label="Avg. Lead Time"
          value={`${avgLeadTimeDays}d`}
          helpText={<><StatArrow type="decrease" /> 6% vs last month</>}
          icon={RiTimer2Fill}
          color="pink"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
        {/* Chart Card */}
        <Box gridColumn={{ base: "span 1", lg: "span 2" }} bg={bgColor} p={6} borderRadius="xl" border="1px" borderColor={borderColor} shadow="lg" _hover={{ borderColor: "brand.500" }} transition="all 0.2s">
          <Heading size="md" mb={2} color="white">Task Progress by Column</Heading>
          <Text fontSize="sm" color="gray.400" mb={6}>Visual breakdown of tasks across workflow stages.</Text>
          <Box height="250px" w="100%">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="name" tick={{ fill: "#A0AEC0", fontSize: 12 }} />
                <YAxis tick={{ fill: "#A0AEC0", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1A202C", borderRadius: 8, border: "1px solid #2D3748", color: "#F7FAFC" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="count" fill="#d000d0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Live Updates */}
        <Box bg={bgColor} p={6} borderRadius="xl" border="1px" borderColor={borderColor} shadow="lg" _hover={{ borderColor: "brand.500" }} transition="all 0.2s">
          <Heading size="md" mb={2} color="white">Live Updates</Heading>
          <Text fontSize="sm" color="gray.400" mb={6}>Real-time activity log.</Text>
          <Box>
            {recentTasks.length > 0 ? (
              recentTasks.map((t) => (
                <Flex key={t._id} mb={4} align="center">
                  <Flex
                    align="center"
                    justify="center"
                    bg="gray.700"
                    color="brand.300"
                    boxSize="8"
                    borderRadius="full"
                    fontWeight="bold"
                    mr={3}
                    fontSize="xs"
                    border="1px solid"
                    borderColor="gray.600"
                  >
                    {t.title ? t.title[0].toUpperCase() : "?"}
                  </Flex>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.200">
                      {user?.firstName || user?.username || "User"} updated "{t.title}"
                    </Text>
                    <Text fontSize="xs" color="gray.500">2h ago</Text>
                  </Box>
                </Flex>
              ))
            ) : (
              <Text color="gray.500" textAlign="center">No recent activity</Text>
            )}
          </Box>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        <Box gridColumn={{ base: "span 1", lg: "span 2" }} bg={bgColor} p={6} borderRadius="xl" border="1px" borderColor={borderColor} shadow="lg" _hover={{ borderColor: "brand.500" }} transition="all 0.2s">
          <Heading size="md" mb={2} color="white">Performance by Category</Heading>
          <Text fontSize="sm" color="gray.400" mb={6}>Success metrics across different task types.</Text>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color="gray.400">Category</Th>
                  <Th isNumeric color="gray.400">Total Tasks</Th>
                  <Th color="gray.400">Completion</Th>
                  <Th color="gray.400">Velocity</Th>
                </Tr>
              </Thead>
              <Tbody>
                {performanceData.length ? performanceData.map((row) => (
                  <Tr key={row.category} _hover={{ bg: "whiteAlpha.50" }}>
                    <Td fontWeight="medium" color="gray.300">{row.category}</Td>
                    <Td isNumeric color="gray.300">{row.total}</Td>
                    <Td>
                      <Box w="100%" display="flex" alignItems="center">
                        <Progress value={row.pct} size="sm" colorScheme="brand" w="100px" borderRadius="full" mr={2} bg="gray.700" />
                        <Text fontSize="xs" color="gray.400">{row.pct}%</Text>
                      </Box>
                    </Td>
                    <Td>
                      <Badge colorScheme={row.velocity === "High" ? "green" : row.velocity === "Medium" ? "orange" : "red"} variant="subtle">
                        {row.velocity}
                      </Badge>
                    </Td>
                  </Tr>
                )) : (
                  <Tr><Td colSpan={4} textAlign="center" color="gray.500">No category data yet</Td></Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>

        <Box bg={bgColor} p={6} borderRadius="xl" border="1px" borderColor={borderColor} shadow="lg" _hover={{ borderColor: "brand.500" }} transition="all 0.2s">
          <Heading size="md" mb={2} color="white">Global Completion</Heading>
          <Text fontSize="sm" color="gray.400" mb={6}>Progress towards milestones.</Text>
          <Flex direction="column" align="center" justify="center" py={4}>
            <Box position="relative">
              <ResponsiveContainer width={160} height={160}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '10px solid #2D3748', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text fontSize="3xl" fontWeight="bold" color="brand.500">{completionRate}%</Text>
                </div>
              </ResponsiveContainer>
            </Box>
            <SimpleGrid columns={2} spacing={8} mt={8} w="full">
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="white">{doneCount}</Text>
                <Text fontSize="xs" fontWeight="bold" color="green.400">DONE</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="white">{total - doneCount}</Text>
                <Text fontSize="xs" fontWeight="bold" color="orange.400">PENDING</Text>
              </Box>
            </SimpleGrid>
          </Flex>
        </Box>
      </SimpleGrid>

      <AnalyticsGraphs tasks={tasks} />
    </Box>
  );
}

export default AnalyticsDashboard;

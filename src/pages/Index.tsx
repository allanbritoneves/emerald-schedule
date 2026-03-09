import { motion } from "framer-motion";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Dashboard = () => {
  return (
    <motion.div
      className="p-6 space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-serif text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral do seu negócio
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <MetricCards />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <WeeklyChart />
        </motion.div>
        <motion.div variants={fadeUp}>
          <MiniCalendar />
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <UpcomingAppointments />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;

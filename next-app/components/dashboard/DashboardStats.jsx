import { DashboardGrid } from '../layout/DashboardGrid';
import { StatsCard } from '../ui/StatsCard';

/**
 * Dashboard statistics grid component that displays a set of stats cards
 */
export function DashboardStats({ stats = [], cols = 4 }) {
  if (!stats || stats.length === 0) {
    return null;
  }
  
  return (
    <DashboardGrid cols={cols}>
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          link={stat.link}
          linkText={stat.linkText}
          textColorClass={stat.textColorClass}
          bgColorClass={stat.bgColorClass}
          onClick={stat.onClick}
        />
      ))}
    </DashboardGrid>
  );
}
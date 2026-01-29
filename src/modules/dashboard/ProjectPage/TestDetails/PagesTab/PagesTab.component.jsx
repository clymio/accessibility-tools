import style from '@/modules/dashboard/ProjectPage/TestDetails/TestDetails.module.scss';
import { useTerminalStore } from '@/stores';
import { Box, Typography } from '@mui/material';

const PagesTab = ({}) => {
  const { clickedTargetContext } = useTerminalStore();
  const currentTargetNode = clickedTargetContext.curr;

  const count = currentTargetNode.related_target_count + 1;
  const pages = [currentTargetNode.test?.environment_page?.name];
  if (currentTargetNode.related_targets && currentTargetNode.related_targets.length > 0) {
    const relatedPages = currentTargetNode.related_targets.map(t => t.test?.environment_page?.name);
    pages.push(...relatedPages);
  }

  return (
    <Box className={style.tabWrapper}>
      {count === 1
        ? (
          <Typography>Appears only on the {pages[0]} page</Typography>
          )
        : (
          <>
            <Typography>Appears on {count} pages:</Typography>
            <ul>
              {pages.map(page => (
                <li key={page}>
                  <Typography>{page}</Typography>
                </li>
              ))}
            </ul>
          </>
          )}
    </Box>
  );
};

export default PagesTab;

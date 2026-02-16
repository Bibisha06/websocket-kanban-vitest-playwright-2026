import React, { memo } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { BsThreeDotsVertical, BsPaperclip } from "react-icons/bs";

const TaskCard = memo(({ task, onEdit, onDelete, onClick }) => {
  const attachmentCount = task.attachments?.length ?? 0;

  const priorityColors = {
    high: "brand", // Neon Magenta
    medium: "accent", // Neon Purple
    low: "gray",
  };

  const categoryColors = {
    feature: "accent",
    bug: "brand",
    enhancement: "purple",
    design: "pink",
    refactor: "orange",
    documentation: "blue",
    testing: "green",
  };

  return (
    <Box
      bg="gray.800"
      p={4}
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor="gray.700"
      cursor="pointer"
      onClick={onClick}
      _hover={{
        boxShadow: "0 0 15px rgba(255, 0, 255, 0.3)",
        borderColor: "brand.500",
        transform: "translateY(-2px)",
      }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Heading size="sm" color="white" noOfLines={2}>
          {task.title}
        </Heading>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<BsThreeDotsVertical />}
            variant="ghost"
            size="xs"
            aria-label="Options"
            color="gray.400"
            _hover={{ color: "brand.400", bg: "whiteAlpha.200" }}
            onClick={(e) => e.stopPropagation()}
          />
          <MenuList onClick={(e) => e.stopPropagation()}>
            <MenuItem onClick={() => onEdit(task)}>Edit</MenuItem>
            <MenuItem onClick={() => onDelete(task._id)} color="red.300">
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Flex gap={2} mb={4} wrap="wrap">
        <Badge colorScheme={priorityColors[task.priority] || "gray"} variant="solid" borderRadius="full" px={2}>
          {task.priority || 'low'}
        </Badge>
        <Badge
          variant="outline"
          colorScheme={categoryColors[task.category] || "gray"}
          borderRadius="full"
          px={2}
        >
          {task.category || 'feature'}
        </Badge>
      </Flex>

      {attachmentCount > 0 && (
        <Flex mt={3} pt={3} borderTop="1px" borderColor="gray.700" color="gray.500" fontSize="xs">
          <Flex align="center">
            <Icon as={BsPaperclip} mr={1} />
            {attachmentCount}
          </Flex>
        </Flex>
      )}
    </Box>
  );
});

export default TaskCard;

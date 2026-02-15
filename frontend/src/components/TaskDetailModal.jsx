import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Badge,
  VStack,
  HStack,
  Box,
  Icon,
  Image,
  Divider,
} from "@chakra-ui/react";
import { RiFileLine, RiExternalLinkLine } from "react-icons/ri";

const statusLabel = { todo: "To Do", inprogress: "In Progress", done: "Done" };
const priorityLabel = { high: "High", medium: "Medium", low: "Low" };
const categoryLabel = (c) => c && c.charAt(0).toUpperCase() + c.slice(1);

function TaskDetailModal({ task, onClose, onEdit }) {
  if (!task) return null;

  const attachments = task.attachments || [];

  const priorityColors = {
    high: "brand",
    medium: "accent",
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
    <Modal isOpen={true} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" bg="gray.800" border="1px" borderColor="gray.700" boxShadow="0 0 20px rgba(0,0,0,0.5)">
        <ModalHeader borderBottom="1px" borderColor="gray.700" color="white">
          <Text fontSize="xl" fontWeight="bold">Task Details</Text>
        </ModalHeader>
        <ModalCloseButton color="gray.400" _hover={{ color: "white", bg: "whiteAlpha.200" }} />

        <ModalBody pb={6} pt={6}>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1} letterSpacing="wider">TITLE</Text>
              <Text fontSize="lg" fontWeight="medium" color="white">{task.title}</Text>
            </Box>

            <Box>
              <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1} letterSpacing="wider">DESCRIPTION</Text>
              <Box bg="gray.700" p={3} borderRadius="md" border="1px" borderColor="gray.600">
                <Text color="gray.300" whiteSpace="pre-wrap">
                  {task.description || "— No description —"}
                </Text>
              </Box>
            </Box>

            <HStack spacing={8}>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1} letterSpacing="wider">PRIORITY</Text>
                <Badge colorScheme={priorityColors[task.priority] || "gray"} borderRadius="full" px={2} variant="solid">
                  {priorityLabel[task.priority] || task.priority}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1} letterSpacing="wider">CATEGORY</Text>
                <Badge variant="outline" colorScheme={categoryColors[task.category] || "gray"} borderRadius="full" px={2}>
                  {categoryLabel(task.category)}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={1} letterSpacing="wider">STATUS</Text>
                <Text fontSize="sm" color="white" fontWeight="medium">{statusLabel[task.status] || task.status}</Text>
              </Box>
            </HStack>

            {attachments.length > 0 && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={2} letterSpacing="wider">
                  ATTACHMENTS ({attachments.length})
                </Text>
                <VStack align="stretch" spacing={2}>
                  {attachments.map((att, i) => (
                    <HStack key={i} p={2} bg="gray.700" borderRadius="md" spacing={3} border="1px" borderColor="gray.600">
                      <Icon as={RiFileLine} color="gray.400" boxSize={5} />
                      <Box flex={1}>
                        <Text fontSize="sm" fontWeight="medium" noOfLines={1} color="gray.200">{att.fileName || 'Unnamed file'}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {att.fileSize ? `${(att.fileSize / 1024).toFixed(1)} KB` : "Size unknown"}
                        </Text>
                      </Box>
                      {att.fileUrl && att.fileType && att.fileType.startsWith("image/") && (
                        <Box boxSize="40px" borderRadius="md" overflow="hidden" border="1px" borderColor="gray.600">
                          <Image
                            src={att.fileUrl}
                            alt={att.fileName}
                            objectFit="cover"
                            w="100%"
                            h="100%"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </Box>
                      )}
                      {att.fileUrl && (
                        <Button
                          as="a"
                          href={att.fileUrl}
                          download={att.fileName}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          _hover={{ bg: "blue.900", color: "blue.200" }}
                          onClick={(e) => {
                            if (!att.fileUrl.startsWith('data:')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Icon as={RiExternalLinkLine} />
                        </Button>
                      )}
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter bg="gray.800" borderTop="1px" borderColor="gray.700" borderBottomRadius="xl">
          <Button variant="ghost" mr={3} onClick={onClose} color="gray.400" _hover={{ bg: "whiteAlpha.100", color: "white" }}>
            Close
          </Button>
          <Button colorScheme="brand" onClick={() => onEdit(task)} _hover={{ bg: "brand.400", boxShadow: "0 0 10px #ff00ff" }}>
            Edit Task
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default TaskDetailModal;

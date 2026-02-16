import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  Box,
  Icon,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { RiUploadCloud2Line, RiFileLine, RiCloseLine } from "react-icons/ri";

function formatFileSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function TaskForm({ task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    category: "feature",
    attachments: [],
  });

  const [previewFiles, setPreviewFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        _id: task._id,
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        category: task.category || "feature",
        attachments: task.attachments || [],
      });
      setPreviewFiles(task.attachments || []);
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const processFiles = (files) => {
    const list = Array.from(files || []);

    list.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit.`,
          status: "error",
          duration: 3000,
        });
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not supported. Use Images or PDFs.`,
          status: "error",
          duration: 3000,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment = {
          fileName: file.name,
          fileUrl: event.target.result,
          fileType: file.type,
          fileSize: file.size,
        };

        setPreviewFiles((prev) => [...prev, newAttachment]);
        setFormData((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), newAttachment],
        }));
      };

      reader.onerror = (error) => {
        toast({
          title: "File read error",
          description: `Failed to read ${file.name}`,
          status: "error",
          duration: 3000,
        });
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemoveFile = (index) => {
    setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }

    onSubmit(formData);
  };

  const isEdit = Boolean(task);

  return (
    <Modal isOpen={true} onClose={onCancel} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" bg="gray.800" border="1px" borderColor="gray.700" boxShadow="0 0 20px rgba(0,0,0,0.5)">
        <ModalHeader borderBottom="1px" borderColor="gray.700" color="white">
          {isEdit ? "Edit Task" : "Create New Task"}
        </ModalHeader>
        <ModalCloseButton color="gray.400" _hover={{ color: "white", bg: "whiteAlpha.200" }} />
        <ModalBody py={6}>
          <VStack spacing={5} as="form" id="task-form" onSubmit={handleSubmit}>
            <FormControl isInvalid={errors.title} isRequired>
              <FormLabel color="gray.300">Task Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Redesign landing page"
                variant="filled"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _hover={{ bg: "gray.600" }}
                _focus={{ bg: "gray.700", borderColor: "brand.500", boxShadow: "0 0 0 1px #d000d0" }}
                _placeholder={{ color: "gray.500" }}
              />
              <FormErrorMessage>{errors.title}</FormErrorMessage>
            </FormControl>

            <HStack w="full" spacing={4}>
              <FormControl>
                <FormLabel color="gray.300">Priority</FormLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  variant="filled"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ bg: "gray.600" }}
                  _focus={{ bg: "gray.700", borderColor: "brand.500" }}
                  sx={{ option: { bg: "gray.800" } }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color="gray.300">Category</FormLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  variant="filled"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ bg: "gray.600" }}
                  _focus={{ bg: "brand.500", borderColor: "brand.500" }}
                  sx={{ option: { bg: "gray.800" } }}
                >
                  <option value="bug">Bug</option>
                  <option value="feature">Feature</option>
                  <option value="enhancement">Enhancement</option>
                  <option value="design">Design</option>
                  <option value="refactor">Refactor</option>
                  <option value="documentation">Documentation</option>
                  <option value="testing">Testing</option>
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel color="gray.300">Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add more details about this task..."
                variant="filled"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _hover={{ bg: "gray.600" }}
                _focus={{ bg: "gray.700", borderColor: "brand.500", boxShadow: "0 0 0 1px #d000d0" }}
                _placeholder={{ color: "gray.500" }}
                minH="120px"
              />
            </FormControl>

            {isEdit && (
              <FormControl>
                <FormLabel color="gray.300">Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  variant="filled"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ bg: "gray.600" }}
                  _focus={{ bg: "gray.700", borderColor: "brand.500" }}
                  sx={{ option: { bg: "gray.800" } }}
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </Select>
              </FormControl>
            )}

            <FormControl>
              <FormLabel color="gray.300">Attachments</FormLabel>
              <Box
                border="2px dashed"
                borderColor={dragOver ? "brand.500" : "gray.600"}
                bg={dragOver ? "whiteAlpha.100" : "gray.700"}
                borderRadius="md"
                p={6}
                textAlign="center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ borderColor: "brand.400", bg: "gray.600" }}
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.docx"
                  onChange={handleFileChange}
                  display="none"
                />
                <VStack spacing={2}>
                  <Icon as={RiUploadCloud2Line} boxSize={8} color={dragOver ? "brand.400" : "gray.400"} />
                  <Text color="gray.300" fontSize="sm">
                    Click or drag files to upload
                  </Text>
                  <Text color="gray.500" fontSize="xs">
                    PDF, PNG, JPG up to 10MB
                  </Text>
                </VStack>
              </Box>

              {previewFiles.length > 0 && (
                <VStack mt={4} align="stretch" spacing={2}>
                  {previewFiles.map((file, index) => (
                    <HStack
                      key={index}
                      bg="gray.700"
                      p={2}
                      borderRadius="md"
                      justify="space-between"
                      border="1px"
                      borderColor="gray.600"
                    >
                      <HStack>
                        <Icon as={RiFileLine} color="gray.400" />
                        <Box>
                          <Text fontSize="sm" noOfLines={1} maxW="200px" color="gray.200">
                            {file.fileName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatFileSize(file.fileSize)}
                          </Text>
                        </Box>
                      </HStack>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(index);
                        }}
                        _hover={{ bg: "red.900", color: "red.300" }}
                      >
                        <Icon as={RiCloseLine} />
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor="gray.700" bg="gray.800" borderBottomRadius="xl">
          <Button variant="ghost" mr={3} onClick={onCancel} color="gray.400" _hover={{ bg: "whiteAlpha.100", color: "white" }}>
            Cancel
          </Button>
          <Button colorScheme="brand" form="task-form" type="submit" _hover={{ bg: "brand.400", boxShadow: "0 0 10px #ff00ff" }}>
            {isEdit ? "Save Changes" : "Create Task"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default TaskForm;

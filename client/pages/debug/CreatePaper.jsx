import React, { useCallback, useState } from "react";
import { navigate } from "raviger";
import nextId from "react-id-generator";
import { createPrice, updatePrice,parseCsv, createPaper } from "../../helpers/calculator";
import useFetch from "../../hooks/useFetch";
import {
  EmptyState,
  LegacyCard,
  Page,
  Modal,
  Listbox,
  LegacyStack,
  TextField,
  Divider,
  Text,
  Button,
  IndexTable,
  useIndexResourceState,
  Icon,
  Toast,
  Frame,
  DropZone,
  Thumbnail,
  Spinner,
} from "@shopify/polaris";
import {
  CashDollarMajor,
  CirclePlusMinor,
  DeleteMinor,
  NoteMinor
} from "@shopify/polaris-icons";

const CreatePaper = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [price, setPrice] = useState(0);
  const [priceTitle, setPriceTitle] = useState("");
  const [priceList, setPriceList] = useState([]);
  const [list, setList] = useState([]);
  const [toastActive, setToastActive] = useState(false);
  const [file, setFile] = useState();
  const [fileModal,setFileModal] = useState(false);
  const [priceLoader,setPriceLoader] = useState(false);

  const fetch = useFetch();
  function handlePriceChange(newValue) {
    setPriceTitle(newValue);
  }

  const priceAdd = useCallback(() => {
    const newPriceData = { id: nextId(),type, price };
    setList((prev) => [newPriceData, ...prev]);
  }, [type, price]);
  
  const priceDelete = useCallback(() => {
    setList((prev) => {
      if (prev.length === 0) return prev;
  
      return prev.slice(1);
    });
  }, []);

  const handleRemove = (data) => {
    // console.log(priceList,data)
    setPriceList((prevList) => prevList.filter(item => !data.includes(item.id)));
    clearSelection();
  }

  const addPriceTable = () => {
    setPriceList((prev) => [...list, ...prev]);
    setOpen(false);
    setList([]);
  };
  function closeFileModal(){
    setFileModal(false);
    setFile();
  }
  const resourceName = {
    singular: "Paper",
    plural: "Papers",
  };
  const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } =
    useIndexResourceState(priceList);
  const toastMarkup = <Toast content="Paper Type Added"></Toast>;
  let listMarkup = priceList.map(({ id, type, price }, ind) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={selectedResources.includes(id)}
      position={ind}
    >
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {type}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" variant="bodyMd">
          {price}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));
  const createPriceDb = () => {
    let priceData = {
      title: priceTitle,
      pricing: priceList,
    };
    createPaper(priceData, fetch, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(priceData),
    });
    navigate("/debug/papers/");
  };
  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) =>
      setFile(acceptedFiles[0]),
    [],
  );
  const handleFileSave = async () =>{
    setPriceLoader(true);
    let data = new FormData();
    console.log(file)
    data.append('file',file);
    data.append('storeData',{
      'store':'testing'
    })
    try{
      const request = await parseCsv(fetch,{
        method:"POST",
        body: data
      });
      setPriceList(request);
      setFileModal(false);
      setFile();
      setPriceLoader(false);
    }catch(err){
      console.log(err);
    }
  }
  const validImageTypes = ['csv'];
  const fileUpload = !file && <DropZone.FileUpload />;
  const uploadedFile = file && (<LegacyStack>
      <Thumbnail
        size="small"
        alt={file.name}
        source={
          validImageTypes.includes(file.type)
            ? window.URL.createObjectURL(file)
            : NoteMinor
        }
      />
      <div>
        {file.name}{' '}
        <Text variant="bodySm" as="p">
          {file.size} bytes
        </Text>
      </div>
    </LegacyStack>);
  return (
    <Frame>
      <Page
        backAction={{
          content: "Papers Type",
          onAction: () => {
            navigate("/debug/papers");
          },
        }}
        secondaryActions={[
          {
            content:"Import",
            onAction: () =>{
              setFileModal(true)
            }
          },
          {
            content: "Add Price",
            onAction: () => {
              setOpen(true);
            },
          },
        ]}
        primaryAction={{
          content: "Save",
          onAction: () => {
            createPriceDb();
          },
        }}
      >
        {toastActive && toastMarkup}
        <div
          style={{
            marginBottom: "20px",
          }}
        >
          <TextField
            label="Paper Type Name"
            value={priceTitle}
            autoComplete="off"
            onChange={handlePriceChange}
          />
        </div>
        <Modal open={fileModal}
          onClose={closeFileModal}
          title="Upload CSV File"
          primaryAction={{
            content:"Save",
            loading: priceLoader,
            onAction:handleFileSave
          }}
          secondaryActions={[
            {
              content:'Cancel',
              onAction:closeFileModal
            }
          ]}
        >
          <div style={{padding: "40px"}}>
            <DropZone allowMultiple={false} accept=".csv" onDrop={handleDropZoneDrop}>
              {uploadedFile}
              {fileUpload}
            </DropZone>
          </div>
        </Modal>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Create New Paper Type"
          primaryAction={{
            content: "Save",
            onAction: addPriceTable,
          }}
          secondaryActions={{
            content: "Cancel",
            onAction: () => {
              setOpen(false);
            },
          }}
        >
          <Modal.Section>
            <Listbox accessibilityLabel="Add Paper Type Value">
              <Listbox.Option key={"price-headings"} value={"price-headings"}>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-around",
                    padding: "10px",
                  }}
                >
                  <Text as="span" fontWeight="bold" variant="bodyMd">
                    Type
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="bold">
                    Price
                  </Text>
                </div>
              </Listbox.Option>
              {list.length > 0 && (
                <>
                  {list.map((el, ind) => (
                    <Listbox.Option key={"price-" + ind} value={"price-" + ind}>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-around",
                          padding: "10px",
                          paddingLeft:"0px"
                        }}
                      >
                        <Text as="span" variant="bodyMd">
                          {el.type}
                        </Text>
                        <Text as="span" variant="bodyMd">
                          {el.price}
                        </Text>
                      </div>
                    </Listbox.Option>
                  ))}
                  <div style={{ height: "8px", width: "100%" }}></div>
                  <Divider />
                  <div style={{ height: "8px", width: "100%" }}></div>
                </>
              )}

              <LegacyStack horizontal wrap={false} distribution="fillEvenly">
                <LegacyStack.Item>
                  <div>
                    <TextField
                      placeholder="Type"
                      value={type}
                      onChange={useCallback(
                        (newValue) => setType(newValue),
                        []
                      )}
                      type="text"
                    />
                  </div>
                </LegacyStack.Item>
                <LegacyStack.Item>
                  <div>
                    <TextField
                      placeholder="Price"
                      value={price}
                      onChange={useCallback(
                        (newValue) => setPrice(newValue),
                        []
                      )}
                      type="text"
                    />
                  </div>
                </LegacyStack.Item>
              </LegacyStack>
              <LegacyStack spacing="tight">
                <div style={{ marginTop: "10px" }}>
                  <Button icon={CirclePlusMinor} onClick={priceAdd}>
                    Add
                  </Button>
                  <Button icon={CirclePlusMinor} onClick={priceDelete}>
                    Delete
                  </Button>
                </div>
              </LegacyStack>
            </Listbox>
          </Modal.Section>
        </Modal>
        <LegacyCard>
          {priceList.length == 0 && (
            <EmptyState
              heading="Create Paper Type Option For Calculator"
              action={{
                content: "Add Paper Type",
                icon: CashDollarMajor,
                onAction: () => {
                  setOpen(true);
                },
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            ></EmptyState>
          )}
          {priceList.length > 0 && (
            <IndexTable
              resourceName={resourceName}
              itemCount={priceList.length}
              selectedItemsCount={
                allResourcesSelected ? "ALL" : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                {
                  title: "Type",
                },
                {
                  title: "Price",
                },
              ]}
              promotedBulkActions={[
                {
                  content: "Remove",
                  onAction: () => handleRemove(selectedResources),
                },
              ]}
            >
              {listMarkup}
            </IndexTable>
          )}
        </LegacyCard>
      </Page>
    </Frame>
  );
};

export default CreatePaper;
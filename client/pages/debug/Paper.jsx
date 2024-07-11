import {
  EmptyState,
  IndexTable,
  LegacyCard,
  Page,
  useIndexResourceState,
  Text,
  Frame,
  Loading,
  Modal,
  LegacyStack,
  TextField,
  Listbox,
  Divider,
  Button
} from "@shopify/polaris";
import { CirclePlusMinor } from "@shopify/polaris-icons";
import { navigate,usePath } from "raviger";
import React, { useEffect,useState,useCallback } from "react";
import { getPaper,updatePrice } from "../../helpers/calculator";
import useFetch from "../../hooks/useFetch";
import nextId from "react-id-generator";

const Price  = () => {
  const fetch = useFetch();
  const path = usePath();
  let id = path.split("papers/paper-")[1];
  const [loading,setLoading] = useState(true);
  const [title,setTitle] = useState("");
  const [pricesList,setPriceList] = useState([]);
  const [list,setList] = useState([]);
  const [open,setOpen] = useState(false);
  const [type,setType] = useState(0);
  const [price,setPrice] = useState(0);
  
  const resourceName = {
    singular: "Paper",
    plural: "Papers",
  };
  console.log(pricesList)
  const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } =
    useIndexResourceState(pricesList);
  const priceUpdate = useCallback(() => {
  let priceData = {
      id: nextId(),
      type: type,
      price: price,
  };
  setList((prev) => [priceData, ...prev]);
  }, [type, price]);
  const rowMarkup = pricesList.map(({ _id, type, price }, ind) => (
    <IndexTable.Row
      id={_id}
      key={_id}
      selected={selectedResources.includes(_id)}
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
  const savePriceListing = async () =>{
      let updatedPricing = [...list,...pricesList];
      let options = {
          method:"POST",
          headers:{
              "content-type":"application/json"
          },
          body: JSON.stringify({
              id:id,
              pricing:updatedPricing
          })
      }
      let data = await updatePrice(fetch,options);
      let pricing = data.pricing.map(el =>({id : el._id,...el}));
      setPriceList(pricing);
      setList([]);
      setOpen(false);
  }
  useEffect(()=>{
      (async function getPriceData(){
          let data = await getPaper(id,fetch);
          let pricing = data.pricing.map(el =>({id : el._id,...el}));
          setLoading(false);
          setTitle(data.title);
          setPriceList(pricing);
      })()
  },[])
  if(loading){
      return  <div style={{height: '100px'}}>
      <Frame>
        <Loading />
      </Frame>
    </div>
    }
  return (
    <Page
      title={title}
      backAction={{
        content: "Paper Type",
        onAction: () => {
          navigate("/debug/papers/");
        },
      }}
      primaryAction={{
        content: "Add",
        onAction: () => {
          setOpen(true);
        },
      }}
    >
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create New Paper Type"
        primaryAction={{
          content: "Add",
          onAction: () =>{
              savePriceListing();
              setList([]);
          },
        }}
        secondaryActions={{
          content: "Cancel",
          onAction: () => {
            setOpen(false);
            setList([]);
          },
        }}
      >
        <Modal.Section>
          <Listbox accessibilityLabel="Add pricing value">
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
                    min={0}
                    onChange={(newValue) => setType(newValue) }
                    type="number"
                  />
                </div>
              </LegacyStack.Item>
              <LegacyStack.Item>
                <div>
                  <TextField
                    placeholder="Price"
                    value={price}
                    min={0}
                    onChange={(newValue) => setPrice(newValue) }
                    type="number"
                  />
                </div>
              </LegacyStack.Item>
            </LegacyStack>
            <LegacyStack spacing="tight">
              <div style={{ marginTop: "10px" }}>
                <Button icon={CirclePlusMinor}  onClick={priceUpdate}>
                  Add
                </Button>
              </div>
            </LegacyStack>
          </Listbox>
        </Modal.Section>
      </Modal>
      {pricesList.length == 0 && (
        <LegacyCard sectioned>
          <EmptyState
            heading="Manage Calculator Paper Type"
            action={{ content: "Add Paper Type" }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Add Paper Type for calcualtors</p>
          </EmptyState>
        </LegacyCard>
      )}
      { pricesList.length > 0 && 
          <LegacyCard>
          <IndexTable
              resourceNasme={resourceName}
              itemCount={pricesList.length}
              selectedItemsCount={
              allResourcesSelected ? "All" : selectedResources.length
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
          >
              {rowMarkup}
          </IndexTable>
          </LegacyCard>
      }
    </Page>
  );
};

export default Price
import React, { useEffect, useState, useCallback } from "react";
import {
  Page,
  Frame,
  Loading,
  EmptyState,
  LegacyCard,
  Grid,
  IndexTable,
  Badge,
  useIndexResourceState,
  Text,
  Modal,
  ChoiceList,
  LegacyStack,
  Toast,
  TextField,
} from "@shopify/polaris";
import { AddProductMajor } from "@shopify/polaris-icons";
import { navigate, usePath } from "raviger";
import {
  getcalculator,
  getProducts,
  getPricing,
  updateCalculator,
  getPrice,
  getPaper,
  getPapers,
} from "../../helpers/calculator";
import useFetch from "../../hooks/useFetch";

const Calculator = () => {
  const path = usePath();
  const fetch = useFetch();
  const [open, setOpen] = useState(false);
  const [priceModal, setPriceModal] = useState(false);
  const [paperModal, setPaperModal] = useState(false);
  const [minMaxModal, setMinMaxModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [pricing, setPricing] = useState([]);
  const [papers, setPapers] = useState([]);
  const [pricingList, setPricingList] = useState([]);
  const [papersList, setPapersList] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState([]);
  const [toastDisplay, setToastDisplay] = useState(false);
  const [minWidth, setMinWidth] = useState(0);
  const [maxWidth, setMaxWidth] = useState(0);
  const [minHeight, setMinHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);

  let id = path.split("/");
  id = id[id.length - 1];
  const {
    selectedResources: pricingSelectedResoucrce,
    allResourcesSelected: pricingAllResourcesSelected,
    handleSelectionChange: handlePriceSelectionChange,
  } = useIndexResourceState(pricing);
  const {
    selectedResources: papersSelectedResoucrce,
    allResourcesSelected: papersAllResourcesSelected,
    handleSelectionChange: handlePaperSelectionChange,
  } = useIndexResourceState(papers);
  const pricingResourceName = {
    singular: "Pricing",
    plural: "Pricings",
  };
  const papersResourceName = {
    singular: "Paper",
    plural: "Papers",
  };
  const actions = [
    {
      content: "Remove Products",
      onAction: () => console.log("Delete the foloowing"),
    },
  ];
  const priceActions = [
    {
      content: "Remove Price",
      onAction: () => setPricing([]),
    },
  ];
  const pricingMarkup = pricing.map(({ title, id }, ind) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={pricingSelectedResoucrce.includes(id)}
      position={ind}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {title}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));
  const papersMarkup = papers.map(({ title, id }, ind) => (
    <IndexTable.Row
      id={id}
      key={id}
      selected={papersSelectedResoucrce.includes(id)}
      position={ind}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {title}
        </Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));
  const handleSelectedPrice = useCallback((value) => {
    setSelectedPrice(value);
  }, []);
  const handleSelectedPaper = useCallback((value) => {
    setSelectedPaper(value);
  }, []);
  const handleChange = useCallback((newValue) => {
    let tempTag = "cal-"+newValue.toLowerCase().replaceAll(" ", "-");
    setTitle(newValue);
    setTag(tempTag);
  }, []);
  const handleChangeMinWidth = useCallback(
    (newValue) => setMinWidth(newValue),
    []
  );
  const handleChangeMaxWidth = useCallback(
    (newValue) => setMaxWidth(newValue),
    []
  );
  const handleChangeMinHeight = useCallback(
    (newValue) => setMinHeight(newValue),
    []
  );
  const handleChangeMaxHeight = useCallback(
    (newValue) => setMaxHeight(newValue),
    []
  );
  const updateCalcualtorData = useCallback(async () => {
    try {
      const data = {
        id: id.split("calc-")[1],
        title: title,
        tag: tag,
        pricing: pricing.length > 0 ? pricing[0]._id : null,
        papers: papers.length > 0 ? papers[0]._id : null,
        minMaxWidth: { min: minWidth, max: maxWidth },
        minMaxHeight: { min: minHeight, max: maxHeight },
      };

      console.log("***********************",data)

      const updatedData = await updateCalculator(data, fetch);

      if (updatedData) {
        setToastDisplay(true);
      } else {
        console.error("Failed to update calculator data.");
      }
    } catch (error) {
      console.error("Error updating calculator data:", error);
    }
  }, [title, tag, pricing, papers, minWidth, maxWidth, minHeight, maxHeight]);

  useEffect(() => {
    (async function fetchData() {
      let data = await getcalculator(id, fetch);
      console.log(data);
      setTitle(data.title);
      setTag(data.tag);
      if (data.price) {
        let pricingData = await getPrice(data.price, fetch);
        setPricing([pricingData]);
      }
      if (data.paper) {
        let papersData = await getPaper(data.paper, fetch);
        setPapers([papersData]);
      }
      let pricingList = await getPricing(fetch);
      pricingList = pricingList.map((price) => ({ id: price._id, ...price }));
      setPricingList(pricingList);
      let papersList = await getPapers(fetch);
      papersList = papersList.map((paper) => ({ id: paper._id, ...paper }));
      setPapersList(papersList);
      setMinWidth(data.minMaxWidth.min);
      setMaxWidth(data.minMaxWidth.max);
      setMinHeight(data.minMaxHeight.min);
      setMaxHeight(data.minMaxHeight.max);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ height: "100px" }}>
        <Frame>
          <Loading />
        </Frame>
      </div>
    );
  }

  return (
    <Page
      fullWidth
      backAction={{
        content: "Calculator heading",
        onAction: () => navigate("/debug/calculators"),
      }}
      primaryAction={{
        content: "Update Calculator",
        onAction: updateCalcualtorData,
      }}
      secondaryActions={[
        {
          content: "Add Products",
          onAction: () => {
            setOpen(true);
          },
        },
        {
          content: "Update Price",
          onAction: () => {
            setPriceModal(true);
          },
        },
        {
          content: "Update Paper Type",
          onAction: () => {
            setPaperModal(true);
          },
        },
        {
          content: "MinMax Width & Height",
          onAction: () => {
            setMinMaxModal(true);
          },
        },
      ]}
    >
      <Frame>
        <Modal
          open={priceModal}
          onClose={() => setPriceModal(false)}
          title="Choose Pricing"
          primaryAction={{
            content: "Save",
            onAction: (value) => {
              setPricing(selectedPrice);
              setPriceModal(false);
            },
          }}
        >
          <Modal.Section>
            <LegacyStack vertical>
              <LegacyStack.Item>
                {pricingList.length > 0 && (
                  <ChoiceList
                    title="Pricings"
                    choices={pricingList.map((el) => ({
                      label: el.title,
                      value: el,
                    }))}
                    onChange={handleSelectedPrice}
                    selected={selectedPrice}
                  />
                )}
                {pricingList.length == 0 && (
                  <EmptyState
                    heading="No Price Found"
                    action={{
                      content: "Create Pricing",
                      onAction: () => navigate("/debug/prices/create-price"),
                    }}
                  >
                    <p>No existing Price found please create new price</p>
                  </EmptyState>
                )}
              </LegacyStack.Item>
            </LegacyStack>
          </Modal.Section>
        </Modal>
        <Modal
          open={paperModal}
          onClose={() => setPaperModal(false)}
          title="Choose Paper Type"
          primaryAction={{
            content: "Save",
            onAction: (value) => {
              setPapers(selectedPaper);
              setPaperModal(false);
            },
          }}
        >
          <Modal.Section>
            <LegacyStack vertical>
              <LegacyStack.Item>
                {papersList.length > 0 && (
                  <ChoiceList
                    title="Paper Type"
                    choices={papersList.map((el) => ({
                      label: el.title,
                      value: el,
                    }))}
                    onChange={handleSelectedPaper}
                    selected={selectedPaper}
                  />
                )}
                {papersList.length == 0 && (
                  <EmptyState
                    heading="No Paper Type Found"
                    action={{
                      content: "Create Paper Type",
                      onAction: () => navigate("/debug/papers/create-paper"),
                    }}
                  >
                    <p>No existing Price found please create new price</p>
                  </EmptyState>
                )}
              </LegacyStack.Item>
            </LegacyStack>
          </Modal.Section>
        </Modal>
        <Modal
          open={minMaxModal}
          onClose={() => setMinMaxModal(false)}
          title="Set Min & Max, Width & Height"
          primaryAction={{
            content: "Save",
            onAction: (value) => {
              setMinMaxModal(false);
            },
          }}
        >
          <Modal.Section>
            <LegacyStack vertical>
              <LegacyStack.Item>
                <TextField
                  label="Enter Min Width"
                  type="number"
                  value={minWidth}
                  onChange={handleChangeMinWidth}
                  autoComplete="off"
                />
                <TextField
                  label="Enter Max Width"
                  type="number"
                  value={maxWidth}
                  onChange={handleChangeMaxWidth}
                  autoComplete="off"
                />
                <TextField
                  label="Enter Min Height"
                  type="number"
                  value={minHeight}
                  onChange={handleChangeMinHeight}
                  autoComplete="off"
                />
                <TextField
                  label="Enter Max Height"
                  type="number"
                  value={maxHeight}
                  onChange={handleChangeMaxHeight}
                  autoComplete="off"
                />
              </LegacyStack.Item>
            </LegacyStack>
          </Modal.Section>
        </Modal>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 12, lg: 12 }}>
            <TextField
              label="Calcualtor Name"
              autoComplete="off"
              value={title}
              onChange={handleChange}
              helpText="Please Input Calculator Title"
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 12, lg: 12 }}>
            <TextField
              label="Calcualtor Tag"
              autoComplete="off"
              value={tag}
              readOnly
              helpText="Add this tag in the product for calculator to work"
            />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <LegacyCard>
              {pricing.length == 0 && (
                <EmptyState
                  heading="No Pricing Rule Selected"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  action={{
                    content: "Add Pricing",
                    icon: AddProductMajor,
                    onAction: () => {
                      setPriceModal(true);
                    },
                  }}
                >
                  <p>Choose Pricing to add </p>
                </EmptyState>
              )}
              {pricing.length > 0 && (
                <IndexTable
                  resourceName={pricingResourceName}
                  itemCount={pricing.length}
                  selectedItemsCount={
                    pricingAllResourcesSelected
                      ? "All"
                      : pricingSelectedResoucrce.length
                  }
                  headings={[{ title: "Pricing Group" }]}
                  onSelectionChange={handlePriceSelectionChange}
                  // promotedBulkActions={priceActions}
                  primaryAction={{
                    content: "Add Pricing",
                    action: () => {
                      console.log("clicked");
                    },
                  }}
                >
                  {pricingMarkup}
                </IndexTable>
              )}
            </LegacyCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <LegacyCard>
              {papers.length == 0 && (
                <EmptyState
                  heading="No Pricing Rule Selected"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  action={{
                    content: "Add Pricing",
                    icon: AddProductMajor,
                    onAction: () => {
                      setPaperModal(true);
                    },
                  }}
                >
                  <p>Choose Paper Type to add </p>
                </EmptyState>
              )}
              {papers.length > 0 && (
                <IndexTable
                  resourceName={papersResourceName}
                  itemCount={papers.length}
                  selectedItemsCount={
                    papersAllResourcesSelected
                      ? "All"
                      : papersSelectedResoucrce.length
                  }
                  headings={[{ title: "Paper Type Group" }]}
                  onSelectionChange={handlePaperSelectionChange}
                  // promotedBulkActions={priceActions}
                  primaryAction={{
                    content: "Add Paper Type",
                    action: () => {
                      console.log("clicked");
                    },
                  }}
                >
                  {papersMarkup}
                </IndexTable>
              )}
            </LegacyCard>
          </Grid.Cell>
        </Grid>
        {toastDisplay && (
          <Toast
            content="Calulator Data Updated"
            onDismiss={() => setToastDisplay(false)}
            duration={4500}
          />
        )}
      </Frame>
    </Page>
  );
};

export default Calculator;

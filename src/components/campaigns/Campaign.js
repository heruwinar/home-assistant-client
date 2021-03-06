
import * as _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { FormGroup, Button, Row } from 'reactstrap';
import EntityMenu from '../common/EntityMenu';
import { EntityBase } from '../common';
import { Dropdown, DatePeriodPicker } from "../common";
import { PromotionBox } from '../promotions/PromotionBox';
import promotionService from '../../services/promotionService';
import campaignService from '../../services/campaignService';
import productService from "../../services/productService";
import shopService from "../../services/shopService";

const calculateStatus = (period) => {
  if (moment().isBetween(period.startDate, period.endDate)) {
    return 'active';
  } else if (moment().isBefore(period.startDate)) {
    return 'pending';
  } else {
    return 'expired';
  }
}

class Campaign extends EntityBase {
  constructor(props) {
    super(props);
    this.entityService = campaignService;
    this.state = {
      ...this.state,
      promotions: [{
        name: '',
      }],
    }
    this.defaultItemData = {
      startDate: moment().startOf('week').toDate(),
      endDate: moment().endOf('week').toDate()
    }
  }

  componentDidMount() {
    super.componentDidMount();
    this.getShops();
    this.getPromotions();
    this.getProducts();
  }

  getPromotions = () => {
    const { id } = this.state;
    if (id !== 'new') {
      promotionService.query({campaign: id}).then(res => {
        this.setState({promotions: res})
      });
    }
  }

  getShops = () => {
    shopService.query().then(shops => {
      this.setState({ shops })
    })
  }

  saveItem = () => {
    const { promotions, item, id } = this.state;
    const status = calculateStatus(item);
    const promotionsExtended = promotions.map(p => ({ ...p, ...item, status }));
    let savePromise;
    if (id === "new") {
      savePromise = this.entityService
        .addItem([{ ...item, promotions: promotionsExtended }])
        .messages({ ok: 'Added', error: 'Error' });
    } else {
      savePromise = this.entityService.updateItem(id, item);
    }
    savePromise.then(
      res => this.props.history.goBack(),
      err => alert(err)
    );
  }

  getProducts() {
    productService.query().then(products => {
      this.props.productsLoaded(products);
    });
  }

  addPromotion = () => {
    const promotions = [...this.state.promotions, { name: '' }];
    this.setState({
      promotions
    })
  }

  removeItem = (i) => {
    this.setState({
      promotions: this.state.promotions.filter((v, k) => k !== i)
    })
  }

  render() {
    const { promotions, item, shops} = this.state;
    const { products } = this.props;
    return (
      <div className="animated fadeIn">
        <div className="section-header">
          <h3 className="inline">Add Campaign</h3>
          <EntityMenu saveItem={this.saveItem} deleteItem={this.deleteItem} entity={item} {...this.props}/>
          <Button onClick={this.props.openDialog} className="fright btn-sm entity-menu-button" color="primary">Add Product</Button>
        </div>
        <hr></hr>
        <FormGroup>
          <div>
            <DatePeriodPicker
              fromLabel={'Active from'}
              startDate={item.startDate}
              endDate={item.endDate}
              onStartChange={selectedDate =>
                this.updateField("startDate", selectedDate)
              }
              onEndChange={selectedDate =>
                this.updateField("endDate", selectedDate)
              }
            ></DatePeriodPicker>
          </div>
        </FormGroup>
        <FormGroup>
        <Dropdown
              items={shops}
              id="shop"
              valueField="_id"
              text="name"
              valueKey="_id"
              onChange={selectedItem => {
                this.updateField("shop", selectedItem._id)
              }}
              placeholder="Select Shop"
              value={item.shop}
            ></Dropdown>
        </FormGroup>
        <hr></hr>
        <Row>
          {promotions.map((p, i) =>
            <PromotionBox className="col-sm-4" key={i} promotion={p} products={products} removeItem={this.removeItem.bind(this, i)}/>
          )}
          <FormGroup className="col-sm-12">
            <Button onClick={this.addPromotion} size="lg" outline color="primary">Add Item</Button>
          </FormGroup>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  products: state.product.list
});

const mapDispatchToProps = dispatch => ({
  productsLoaded: (items) => { dispatch({ type: 'LIST_LOADED', payload: items }) },
  openDialog: () => { dispatch({ type: 'DIALOG_OPEN', payload: { type: 'ProductModal' } }) }
})



export default connect(mapStateToProps, mapDispatchToProps)(Campaign);